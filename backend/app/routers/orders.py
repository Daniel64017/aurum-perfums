import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.models import Order, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Pedidos do Cliente"])

def format_order_dict(order: Order) -> dict:
    items_formatted = []
    for item in order.items:
        items_formatted.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_sku": item.product_sku,
            "price": item.price,
            "quantity": item.quantity,
            "item_subtotal": round(item.price * item.quantity, 2)
        })

    payment_dict = None
    if order.payment:
        payload = json.loads(order.payment.payload_json) if order.payment.payload_json else {}
        payment_dict = {
            "id": order.payment.id,
            "method": order.payment.method,
            "status": order.payment.status,
            "transaction_id": order.payment.transaction_id,
            "details": payload
        }

    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": order.subtotal,
        "shipping_cost": order.shipping_cost,
        "discount_amount": order.discount_amount,
        "total": order.total,
        "payment_method": order.payment_method,
        "shipping_address": json.loads(order.shipping_address_json) if order.shipping_address_json else {},
        "shipping_method": order.shipping_method,
        "tracking_code": order.tracking_code,
        "created_at": order.created_at,
        "items": items_formatted,
        "payment": payment_dict
    }

@router.get("", response_model=List[dict])
def list_my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

    return [format_order_dict(o) for o in orders]

@router.get("/{order_number_or_id}", response_model=dict)
def get_order_details(
    order_number_or_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(Order.user_id == current_user.id)

    if order_number_or_id.isdigit():
        order = query.filter(Order.id == int(order_number_or_id)).first()
    else:
        order = query.filter(Order.order_number == order_number_or_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return format_order_dict(order)
