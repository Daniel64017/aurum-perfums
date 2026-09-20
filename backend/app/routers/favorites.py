from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.models import Favorite, Product, User
from app.routers.auth import get_current_user
from app.routers.products import format_product_response

router = APIRouter(prefix="/favorites", tags=["Favoritos / Wishlist"])

@router.get("", response_model=List[dict])
def list_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(Favorite).options(
        joinedload(Favorite.product).joinedload(Product.brand),
        joinedload(Favorite.product).joinedload(Product.category),
        joinedload(Favorite.product).joinedload(Product.images),
        joinedload(Favorite.product).joinedload(Product.reviews)
    ).filter(Favorite.user_id == current_user.id).all()

    return [format_product_response(f.product) for f in favs if f.product]

@router.post("/toggle/{product_id}")
def toggle_favorite(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"is_favorite": False, "message": "Produto removido dos favoritos."}
    else:
        fav = Favorite(user_id=current_user.id, product_id=product_id)
        db.add(fav)
        db.commit()
        return {"is_favorite": True, "message": "Produto adicionado aos favoritos!"}
