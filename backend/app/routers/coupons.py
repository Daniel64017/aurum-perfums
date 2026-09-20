from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Coupon
from app.schemas.schemas import CouponValidateRequest

router = APIRouter(prefix="/coupons", tags=["Cupons"])

@router.post("/validate")
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(
        Coupon.code == req.code.upper().strip(),
        Coupon.is_active == True
    ).first()

    if not coupon:
        raise HTTPException(status_code=404, detail="Cupom inválido ou expirado.")

    if coupon.times_used >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Este cupom atingiu o limite máximo de utilizações.")

    if req.subtotal < coupon.min_purchase:
        raise HTTPException(
            status_code=400,
            detail=f"O valor mínimo de compra para este cupom é de R$ {coupon.min_purchase:.2f}."
        )

    discount_amount = 0.0
    if coupon.discount_type == "percentage":
        discount_amount = round((req.subtotal * coupon.discount_value) / 100.0, 2)
    else:
        discount_amount = coupon.discount_value

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "calculated_discount": discount_amount,
        "message": f"Cupom '{coupon.code}' aplicado com sucesso!"
    }
