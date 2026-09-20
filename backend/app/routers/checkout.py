import json
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.models.models import Order, OrderItem, Payment, Product, Cart, CartItem, User, Coupon
from app.schemas.schemas import CheckoutRequest, OrderResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/checkout", tags=["Checkout e Pagamento Sandbox"])

SHIPPING_RATES = {
    "Normal": {"name": "Entrega Normal Expressa", "price": 25.00, "days": "4 a 6 dias úteis"},
    "Expressa": {"name": "Entrega Sedex VIP", "price": 45.00, "days": "1 a 2 dias úteis"},
    "Retirada": {"name": "Retirada na Boutique Aurum", "price": 0.00, "days": "Disponível em 2 horas"}
}

@router.post("/calculate-shipping")
def calculate_shipping(zip_code: str):
    clean_zip = zip_code.replace("-", "").strip()
    if len(clean_zip) != 8 or not clean_zip.isdigit():
        raise HTTPException(status_code=400, detail="CEP inválido. Digite um CEP com 8 dígitos.")

    return {
        "zip_code": zip_code,
        "options": [
            {"id": "Normal", "name": "Entrega Normal Expressa", "price": 25.00, "deadline": "4 a 6 dias úteis"},
            {"id": "Expressa", "name": "Entrega Sedex VIP Aurum", "price": 45.00, "deadline": "1 a 2 dias úteis"},
            {"id": "Retirada", "name": "Retirada na Boutique Flagship", "price": 0.00, "deadline": "Disponível em 2 horas"}
        ]
    }

@router.post("/place-order", response_model=dict)
def place_order(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Seu carrinho está vazio.")

    subtotal = 0.0
    order_items_data = []

    # Validar itens e estoque
    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.status != "active":
            raise HTTPException(status_code=400, detail=f"O produto {product.name if product else ''} não está disponível.")
        
        if item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {product.name}. Disponível: {product.stock} un."
            )

        unit_price = product.promotional_price if product.promotional_price else product.price
        subtotal += unit_price * item.quantity

        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": unit_price
        })

    # Cupom de desconto
    discount_amount = 0.0
    if req.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == req.coupon_code.upper().strip(),
            Coupon.is_active == True
        ).first()
        if coupon:
            if subtotal >= coupon.min_purchase:
                if coupon.discount_type == "percentage":
                    discount_amount = (subtotal * coupon.discount_value) / 100.0
                else:
                    discount_amount = coupon.discount_value
                coupon.times_used += 1

    # Frete
    ship_info = SHIPPING_RATES.get(req.shipping_method, SHIPPING_RATES["Normal"])
    shipping_cost = ship_info["price"]

    total = max(0.0, round(subtotal + shipping_cost - discount_amount, 2))

    # Gerar Número do Pedido
    order_number = f"AUR-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    tracking_code = f"BR{uuid.uuid4().hex[:9].upper()}AUR"

    # Status inicial de pagamento e pedido
    payment_status = "approved" if req.payment_method in ["pix", "credit_card", "debit_card"] else "pending"
    order_status = "paid" if payment_status == "approved" else "received"

    # Endereço em JSON
    addr_dict = req.shipping_address.dict()
    addr_json = json.dumps(addr_dict, ensure_ascii=False)

    # Criar Pedido
    new_order = Order(
        order_number=order_number,
        user_id=current_user.id,
        status=order_status,
        payment_status=payment_status,
        subtotal=round(subtotal, 2),
        shipping_cost=shipping_cost,
        discount_amount=round(discount_amount, 2),
        total=total,
        payment_method=req.payment_method,
        shipping_address_json=addr_json,
        shipping_method=ship_info["name"],
        tracking_code=tracking_code
    )
    db.add(new_order)
    db.flush()

    # Criar Itens do Pedido e Atualizar Estoque
    for item_data in order_items_data:
        p = item_data["product"]
        q = item_data["quantity"]
        
        db_item = OrderItem(
            order_id=new_order.id,
            product_id=p.id,
            product_name=p.name,
            product_sku=p.sku,
            price=item_data["unit_price"],
            quantity=q
        )
        db.add(db_item)

        # Abater estoque
        p.stock -= q
        if p.stock <= 0:
            p.stock = 0
            p.status = "out_of_stock"

    # Gerar Payload de Pagamento Sandbox
    tx_id = f"SANDBOX-TX-{uuid.uuid4().hex[:10].upper()}"
    payment_payload = {}

    if req.payment_method == "pix":
        copy_paste_code = f"00020126580014br.gov.bcb.pix0136aurum-parfums-{uuid.uuid4().hex[:12]}5204000053039865405{total:.2f}5802BR5913Aurum Parfums6009SAO PAULO62070503***63041234"
        payment_payload = {
            "sandbox_notice": "PAGAMENTO EM MODO SIMULAÇÃO / DEMONSTRAÇÃO",
            "pix_copy_paste": copy_paste_code,
            "qr_code_mock": f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={copy_paste_code}",
            "expires_in_minutes": 30,
            "instructions": "Abra o aplicativo do seu banco, escolha Pagar via PIX e escaneie o código ou cole a chave PIX acima."
        }
    elif req.payment_method in ["credit_card", "debit_card"]:
        card = req.card_details or {}
        installments = card.get("installments", 1)
        installment_val = round(total / int(installments), 2) if installments else total
        payment_payload = {
            "sandbox_notice": "PAGAMENTO EM MODO SIMULAÇÃO / DEMONSTRAÇÃO",
            "card_brand": "Visa VIP Gold",
            "last4": str(card.get("number", "4000"))[-4:],
            "installments": f"{installments}x de R$ {installment_val:.2f}",
            "authorization_code": f"AUTH-{uuid.uuid4().hex[:8].upper()}"
        }
    elif req.payment_method == "boleto":
        barcode = f"34191.09008 61000.123456 78901.234567 8 {int(total*100):014d}"
        due_date = (datetime.datetime.now() + datetime.timedelta(days=3)).strftime("%d/%m/%Y")
        payment_payload = {
            "sandbox_notice": "PAGAMENTO EM MODO SIMULAÇÃO / DEMONSTRAÇÃO",
            "barcode": barcode,
            "due_date": due_date,
            "instructions": "Pague este boleto em qualquer banco ou via Internet Banking até a data de vencimento."
        }

    # Criar registro de Pagamento
    payment_record = Payment(
        order_id=new_order.id,
        method=req.payment_method,
        status=payment_status,
        transaction_id=tx_id,
        payload_json=json.dumps(payment_payload, ensure_ascii=False)
    )
    db.add(payment_record)

    # Limpar carrinho do usuário
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(new_order)

    return {
        "message": "Pedido realizado com sucesso!",
        "order_id": new_order.id,
        "order_number": new_order.order_number,
        "total": new_order.total,
        "status": new_order.status,
        "payment_status": new_order.payment_status,
        "payment_method": new_order.payment_method,
        "payment_details": payment_payload,
        "tracking_code": new_order.tracking_code
    }
