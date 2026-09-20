from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Product, Category, Brand, Review, ProductImage
from app.schemas.schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["Produtos"])

def format_product_response(product: Product) -> dict:
    ratings = [r.rating for r in product.reviews]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0
    review_cnt = len(ratings)

    brand_dict = {
        "id": product.brand.id,
        "name": product.brand.name,
        "slug": product.brand.slug,
        "logo_url": product.brand.logo_url,
        "description": product.brand.description
    } if product.brand else {"id": product.brand_id, "name": "Aurum Privé", "slug": "aurum-prive"}

    category_dict = {
        "id": product.category.id,
        "name": product.category.name,
        "slug": product.category.slug,
        "description": product.category.description,
        "image_url": product.category.image_url
    } if product.category else {"id": product.category_id, "name": "Perfumes", "slug": "perfumes"}

    images_list = [
        {
            "id": img.id,
            "product_id": img.product_id,
            "image_url": img.image_url,
            "is_primary": img.is_primary,
            "display_order": img.display_order
        }
        for img in sorted(product.images, key=lambda img: (not img.is_primary, img.display_order))
    ]

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "brand_id": product.brand_id,
        "category_id": product.category_id,
        "gender": product.gender,
        "description": product.description,
        "volume_ml": product.volume_ml,
        "concentration": product.concentration,
        "olfactory_family": product.olfactory_family,
        "top_notes": product.top_notes,
        "heart_notes": product.heart_notes,
        "base_notes": product.base_notes,
        "price": product.price,
        "promotional_price": product.promotional_price,
        "discount_percent": product.discount_percent,
        "stock": product.stock,
        "sku": product.sku,
        "status": product.status,
        "featured": product.featured,
        "release": product.release,
        "bestseller": product.bestseller,
        "created_at": product.created_at.isoformat() if hasattr(product.created_at, 'isoformat') else str(product.created_at),
        "brand": brand_dict,
        "category": category_dict,
        "images": images_list,
        "average_rating": avg_rating,
        "review_count": review_cnt
    }

@router.get("", response_model=dict)
def list_products(
    search: Optional[str] = None,
    category_slug: Optional[str] = None,
    brand_slug: Optional[str] = None,
    gender: Optional[str] = None,
    olfactory_family: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: Optional[bool] = False,
    featured: Optional[bool] = None,
    release: Optional[bool] = None,
    bestseller: Optional[bool] = None,
    sort_by: Optional[str] = "created_desc",  # price_asc, price_desc, bestseller, rating, created_desc
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.reviews)
    ).filter(Product.status == "active")

    # Pesquisa
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.join(Product.brand).filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.olfactory_family.ilike(search_pattern),
                Brand.name.ilike(search_pattern)
            )
        )

    # Filtros
    if category_slug:
        query = query.join(Product.category).filter(Category.slug == category_slug)
    if brand_slug:
        query = query.join(Product.brand).filter(Brand.slug == brand_slug)
    if gender and gender != "todos":
        query = query.filter(Product.gender == gender)
    if olfactory_family:
        query = query.filter(Product.olfactory_family.ilike(f"%{olfactory_family}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock_only:
        query = query.filter(Product.stock > 0)
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if release is not None:
        query = query.filter(Product.release == release)
    if bestseller is not None:
        query = query.filter(Product.bestseller == bestseller)

    # Ordenação
    if sort_by == "price_asc":
        query = query.order_by(asc(func.coalesce(Product.promotional_price, Product.price)))
    elif sort_by == "price_desc":
        query = query.order_by(desc(func.coalesce(Product.promotional_price, Product.price)))
    elif sort_by == "bestseller":
        query = query.order_by(desc(Product.bestseller), desc(Product.created_at))
    elif sort_by == "release":
        query = query.order_by(desc(Product.release), desc(Product.created_at))
    else:
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    formatted_items = [format_product_response(p) for p in products]

    return {
        "items": formatted_items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/olfactory-families", response_model=List[str])
def get_olfactory_families(db: Session = Depends(get_db)):
    families = db.query(Product.olfactory_family).distinct().all()
    return [f[0] for f in families if f[0]]

@router.get("/{slug_or_id}", response_model=dict)
def get_product_detail(slug_or_id: str, db: Session = Depends(get_db)):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.reviews)
    )

    if slug_or_id.isdigit():
        product = query.filter(Product.id == int(slug_or_id)).first()
    else:
        product = query.filter(Product.slug == slug_or_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Perfume não encontrado.")

    return format_product_response(product)

@router.get("/{product_id}/related", response_model=List[dict])
def get_related_products(product_id: int, limit: int = 4, db: Session = Depends(get_db)):
    current = db.query(Product).filter(Product.id == product_id).first()
    if not current:
        return []

    related = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.reviews)
    ).filter(
        Product.id != product_id,
        Product.status == "active",
        or_(Product.category_id == current.category_id, Product.gender == current.gender)
    ).limit(limit).all()

    return [format_product_response(p) for p in related]
