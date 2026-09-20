import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import stripe

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Order, Payment, User
from app.routers.auth import get_current_user

# Configurar chave secreta da Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["Pagamentos Stripe"])

class CreateIntentRequest(BaseModel):
    amount: float
    currency: str = "brl"
    order_id: Optional[int] = None

class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    order_id: int

class StripeDirectCheckoutRequest(BaseModel):
    payment_method_id: str
    amount: float
    order_id: int

@router.post("/create-intent")
def create_payment_intent(
    req: CreateIntentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Valor de pagamento inválido.")

    amount_cents = int(round(req.amount * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=req.currency.lower(),
            payment_method_types=["card"],
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
                "order_id": str(req.order_id) if req.order_id else ""
            }
        )

        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "publishable_key": settings.STRIPE_PUBLISHABLE_KEY
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Erro na Stripe: {e.user_message or str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar intenção de pagamento: {str(e)}")

@router.post("/confirm-stripe")
def confirm_stripe_payment(
    req: ConfirmPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == req.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    try:
        intent = stripe.PaymentIntent.retrieve(req.payment_intent_id)

        if intent.status == "succeeded":
            order.status = "paid"
            order.payment_status = "approved"

            # Atualizar ou criar registro de pagamento
            payment_record = db.query(Payment).filter(Payment.order_id == order.id).first()
            payload_data = {
                "stripe_payment_intent_id": intent.id,
                "card_brand": intent.payment_method_types[0] if intent.payment_method_types else "cartao",
                "status": intent.status,
                "amount_received": intent.amount_received / 100.0
            }

            if payment_record:
                payment_record.status = "approved"
                payment_record.transaction_id = intent.id
                payment_record.payload_json = json.dumps(payload_data, ensure_ascii=False)
            else:
                payment_record = Payment(
                    order_id=order.id,
                    method="credit_card",
                    status="approved",
                    transaction_id=intent.id,
                    payload_json=json.dumps(payload_data, ensure_ascii=False)
                )
                db.add(payment_record)

            db.commit()
            db.refresh(order)

            return {
                "success": True,
                "status": "paid",
                "order_number": order.order_number,
                "message": "Pagamento aprovado com sucesso via Stripe!"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"O pagamento não foi concluído. Status atual: {intent.status}"
            )

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Erro na Stripe: {e.user_message or str(e)}")

@router.post("/checkout")
def checkout_direct_stripe(
    req: StripeDirectCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rota direta de pagamento Stripe recebendo o PaymentMethod ID enviado pelo frontend
    """
    order = db.query(Order).filter(Order.id == req.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    amount_cents = int(round(req.amount * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="brl",
            payment_method=req.payment_method_id,
            confirm=True,
            off_session=False,
            return_url="http://localhost:5173/confirmacao-pedido",
            metadata={
                "order_id": str(order.id),
                "order_number": order.order_number,
                "user_email": current_user.email
            }
        )

        if intent.status == "succeeded":
            order.status = "paid"
            order.payment_status = "approved"

            payload_data = {
                "stripe_payment_intent_id": intent.id,
                "payment_method_id": req.payment_method_id,
                "status": intent.status,
                "amount": req.amount
            }

            payment_record = db.query(Payment).filter(Payment.order_id == order.id).first()
            if payment_record:
                payment_record.status = "approved"
                payment_record.transaction_id = intent.id
                payment_record.payload_json = json.dumps(payload_data, ensure_ascii=False)
            else:
                payment_record = Payment(
                    order_id=order.id,
                    method="credit_card",
                    status="approved",
                    transaction_id=intent.id,
                    payload_json=json.dumps(payload_data, ensure_ascii=False)
                )
                db.add(payment_record)

            db.commit()
            return {
                "success": True,
                "status": "paid",
                "order_number": order.order_number,
                "payment_intent_id": intent.id
            }
        else:
            return {
                "success": False,
                "status": intent.status,
                "client_secret": intent.client_secret
            }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Erro no processamento da Stripe: {e.user_message or str(e)}")
