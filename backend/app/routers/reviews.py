from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.models import Review, Product, Order, User
from app.schemas.schemas import ReviewCreate, ReviewResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Avaliações"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def list_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).options(joinedload(Review.user)).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    res = []
    for r in reviews:
        res.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_name": r.user.name if r.user else "Cliente"
        })
    return res

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == review_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    # Verificar se o usuário já avaliou
    existing = db.query(Review).filter(
        Review.product_id == review_in.product_id,
        Review.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Você já enviou uma avaliação para este perfume.")

    review = Review(
        product_id=review_in.product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "product_id": review.product_id,
        "user_id": review.user_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "user_name": current_user.name
    }
