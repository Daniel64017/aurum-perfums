from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.models.models import Cart, CartItem, Product, User
from app.schemas.schemas import CartItemCreate, CartItemUpdate
from app.routers.auth import get_current_user
from app.routers.products import format_product_response

router = APIRouter(prefix="/cart", tags=["Carrinho"])

def get_or_create_cart(db: Session, user_id: Optional[int] = None, session_id: Optional[str] = None) -> Cart:
    cart = None
    if user_id:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart and session_id:
            # Tentar migrar carrinho de sessão
            cart = db.query(Cart).filter(Cart.session_id == session_id, Cart.user_id == None).first()
            if cart:
                cart.user_id = user_id
                db.commit()
    elif session_id:
        cart = db.query(Cart).filter(Cart.session_id == session_id, Cart.user_id == None).first()

    if not cart:
        cart = Cart(user_id=user_id, session_id=session_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart

def build_cart_response(cart: Cart) -> dict:
    subtotal = 0.0
    formatted_items = []

    for item in cart.items:
        product = item.product
        if not product or product.status != "active":
            continue

        item_price = product.promotional_price if product.promotional_price else product.price
        item_subtotal = item_price * item.quantity
        subtotal += item_subtotal

        formatted_items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": item_price,
            "item_subtotal": item_subtotal,
            "product": format_product_response(product)
        })

    return {
        "id": cart.id,
        "items": formatted_items,
        "subtotal": round(subtotal, 2)
    }

@router.get("", response_model=dict)
def get_cart(
    x_session_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            from jose import jwt
            from app.core.config import settings
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(payload.get("sub"))
        except Exception:
            pass

    cart = get_or_create_cart(db, user_id=user_id, session_id=x_session_id)
    return build_cart_response(cart)

@router.post("/items", response_model=dict)
def add_item_to_cart(
    item_in: CartItemCreate,
    x_session_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            from jose import jwt
            from app.core.config import settings
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(payload.get("sub"))
        except Exception:
            pass

    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or product.status != "active":
        raise HTTPException(status_code=404, detail="Produto indisponível.")

    cart = get_or_create_cart(db, user_id=user_id, session_id=x_session_id)

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()

    new_quantity = item_in.quantity
    if existing_item:
        new_quantity += existing_item.quantity

    if new_quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Quantidade solicitada ({new_quantity}) excede o estoque disponível ({product.stock} un)."
        )

    if existing_item:
        existing_item.quantity = new_quantity
    else:
        new_item = CartItem(cart_id=cart.id, product_id=item_in.product_id, quantity=item_in.quantity)
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)

@router.put("/items/{item_id}", response_model=dict)
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    x_session_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).options(joinedload(CartItem.product)).filter(CartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item do carrinho não encontrado.")

    if item_update.quantity <= 0:
        db.delete(item)
        db.commit()
    else:
        if item_update.quantity > item.product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente. Máximo disponível: {item.product.stock} unidades."
            )
        item.quantity = item_update.quantity
        db.commit()

    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    return build_cart_response(cart)

@router.delete("/items/{item_id}", response_model=dict)
def remove_cart_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado no carrinho.")

    cart_id = item.cart_id
    db.delete(item)
    db.commit()

    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    return build_cart_response(cart)

@router.delete("/clear", response_model=dict)
def clear_cart(
    x_session_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            from jose import jwt
            from app.core.config import settings
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(payload.get("sub"))
        except Exception:
            pass

    cart = get_or_create_cart(db, user_id=user_id, session_id=x_session_id)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return build_cart_response(cart)
