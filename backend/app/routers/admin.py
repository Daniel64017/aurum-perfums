import os
import uuid
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_
from typing import List, Optional
from PIL import Image

from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    User, Product, ProductImage, Category, Brand, Order, OrderItem, Payment, Coupon
)
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, CategoryResponse, BrandResponse, OrderStatusUpdate
)
from app.routers.auth import get_current_admin
from app.routers.products import format_product_response

router = APIRouter(prefix="/admin", tags=["Painel Administrativo Exclusivo"])

# --- DASHBOARD METRICS ---
@router.get("/stats")
def get_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_revenue = db.query(func.sum(Order.total)).filter(Order.payment_status == "approved").scalar() or 0.0
    total_orders = db.query(Order).count()
    avg_ticket = (total_revenue / total_orders) if total_orders > 0 else 0.0

    total_products = db.query(Product).count()
    total_customers = db.query(User).filter(User.role == "USER").count()
    low_stock_count = db.query(Product).filter(Product.stock <= 5, Product.status == "active").count()

    # Vendas recentes
    recent_orders = db.query(Order).options(joinedload(Order.user)).order_by(Order.created_at.desc()).limit(5).all()
    recent_sales_fmt = [
        {
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.user.name if o.user else "Cliente",
            "total": o.total,
            "status": o.status,
            "created_at": o.created_at
        }
        for o in recent_orders
    ]

    # Produtos mais vendidos (mock baseados no banco)
    top_products_db = db.query(
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label("total_sold"),
        func.sum(OrderItem.price * OrderItem.quantity).label("total_revenue")
    ).group_by(OrderItem.product_name).order_by(desc("total_sold")).limit(5).all()

    top_products_fmt = [
        {"name": row[0], "total_sold": row[1], "revenue": row[2]}
        for row in top_products_db
    ]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "average_order_value": round(avg_ticket, 2),
        "total_products": total_products,
        "total_customers": total_customers,
        "low_stock_products_count": low_stock_count,
        "recent_sales": recent_sales_fmt,
        "top_selling_products": top_products_fmt
    }

# --- PRODUÇÃO E CRUD DE PRODUTOS ---
@router.get("/products", response_model=List[dict])
def list_admin_products(
    search: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.reviews)
    )

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.sku.ilike(pattern),
                Product.olfactory_family.ilike(pattern)
            )
        )

    products = query.order_by(Product.id.desc()).all()
    return [format_product_response(p) for p in products]

@router.post("/products", response_model=dict)
def create_product(
    prod_in: ProductCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Gerar slug único
    base_slug = prod_in.name.lower().replace(" ", "-").replace("'", "").replace('"', "")
    slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    # Garantir SKU único automaticamente
    target_sku = prod_in.sku
    if db.query(Product).filter(Product.sku == target_sku).first():
        target_sku = f"{target_sku}-{uuid.uuid4().hex[:4].upper()}"

    product = Product(
        name=prod_in.name,
        slug=slug,
        brand_id=prod_in.brand_id,
        category_id=prod_in.category_id,
        gender=prod_in.gender,
        description=prod_in.description,
        volume_ml=prod_in.volume_ml,
        concentration=prod_in.concentration,
        olfactory_family=prod_in.olfactory_family,
        top_notes=prod_in.top_notes,
        heart_notes=prod_in.heart_notes,
        base_notes=prod_in.base_notes,
        price=prod_in.price,
        promotional_price=prod_in.promotional_price,
        discount_percent=prod_in.discount_percent,
        stock=prod_in.stock,
        sku=target_sku,
        status=prod_in.status,
        featured=prod_in.featured,
        release=prod_in.release,
        bestseller=prod_in.bestseller
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return format_product_response(product)

@router.put("/products/{product_id}", response_model=dict)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    update_data = prod_in.dict(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] and update_data["sku"] != product.sku:
        if db.query(Product).filter(Product.sku == update_data["sku"], Product.id != product_id).first():
            update_data["sku"] = f"{update_data['sku']}-{uuid.uuid4().hex[:4].upper()}"

    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return format_product_response(product)

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    db.delete(product)
    db.commit()
    return {"message": "Produto excluído com sucesso!"}

# --- UPLOAD DE FOTOS DIRETO DO COMPUTADOR ---
@router.post("/products/{product_id}/upload-images")
async def upload_product_images(
    product_id: int,
    files: Optional[List[UploadFile]] = File(None),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    if not files:
        raise HTTPException(status_code=400, detail="Nenhuma foto foi selecionada para envio.")

    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".jfif", ".avif"}
    saved_images = []

    # Verificar se o produto já tem imagem principal
    has_primary = db.query(ProductImage).filter(
        ProductImage.product_id == product_id,
        ProductImage.is_primary == True
    ).first() is not None

    for idx, file in enumerate(files):
        filename_raw = file.filename or "image.jpg"
        ext = os.path.splitext(filename_raw)[1].lower()
        if not ext or ext not in allowed_exts:
            ext = ".jpg"

        filename = f"prod_{product_id}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(settings.PRODUCT_UPLOAD_DIR, filename)

        # Salvar arquivo no disco
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)

        # URL acessível publicamente via static
        file_url = f"/static/uploads/products/{filename}"

        is_prim = False if has_primary else (idx == 0)
        if is_prim:
            has_primary = True

        img_record = ProductImage(
            product_id=product_id,
            image_url=file_url,
            is_primary=is_prim,
            display_order=idx
        )
        db.add(img_record)
        saved_images.append(img_record)

    if not saved_images:
        raise HTTPException(status_code=400, detail="Nenhuma foto válida foi enviada. Use formatos JPG, PNG ou WEBP.")

    db.commit()

    # Recarregar produto com novas imagens
    db.refresh(product)
    return {
        "message": f"{len(saved_images)} imagem(ns) enviada(s) com sucesso!",
        "product": format_product_response(product)
    }

@router.put("/products/{product_id}/set-primary-image/{image_id}")
def set_primary_image(
    product_id: int,
    image_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db.query(ProductImage).filter(ProductImage.product_id == product_id).update({"is_primary": False})
    db.query(ProductImage).filter(ProductImage.id == image_id, ProductImage.product_id == product_id).update({"is_primary": True})
    db.commit()
    
    product = db.query(Product).filter(Product.id == product_id).first()
    return format_product_response(product)

@router.delete("/products/{product_id}/images/{image_id}")
def delete_product_image(
    product_id: int,
    image_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    img = db.query(ProductImage).filter(ProductImage.id == image_id, ProductImage.product_id == product_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Imagem não encontrada.")

    # Remover arquivo se for local
    if img.image_url.startswith("/static/"):
        rel_path = img.image_url.replace("/static/", "")
        full_path = os.path.join(settings.UPLOAD_DIR, rel_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass

    db.delete(img)
    db.commit()

    product = db.query(Product).filter(Product.id == product_id).first()
    return format_product_response(product)

# --- GERENCIAMENTO DE ESTOQUE ---
@router.patch("/products/{product_id}/stock")
def update_stock(
    product_id: int,
    stock: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    product.stock = max(0, stock)
    if product.stock == 0:
        product.status = "out_of_stock"
    elif product.status == "out_of_stock":
        product.status = "active"

    db.commit()
    return {"message": f"Estoque do produto '{product.name}' atualizado para {product.stock} un."}

# --- GERENCIAMENTO DE PEDIDOS DO PAINEL ---
@router.get("/orders", response_model=List[dict])
def list_admin_orders(
    status_filter: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.items),
        joinedload(Order.payment)
    )

    if status_filter:
        query = query.filter(Order.status == status_filter)

    orders = query.order_by(Order.created_at.desc()).all()

    res = []
    for o in orders:
        res.append({
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.user.name if o.user else "Cliente",
            "customer_email": o.user.email if o.user else "",
            "status": o.status,
            "payment_status": o.payment_status,
            "payment_method": o.payment_method,
            "total": o.total,
            "tracking_code": o.tracking_code,
            "created_at": o.created_at,
            "items_count": len(o.items)
        })
    return res

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    order.status = status_in.status
    if status_in.status == "paid":
        order.payment_status = "approved"

    db.commit()
    return {"message": f"Status do pedido #{order.order_number} alterado para '{order.status}'."}

# --- GERENCIAMENTO DE CLIENTES ---
@router.get("/customers", response_model=List[dict])
def list_admin_customers(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.role == "USER").all()
    res = []
    for u in users:
        orders_count = db.query(Order).filter(Order.user_id == u.id).count()
        total_spent = db.query(func.sum(Order.total)).filter(Order.user_id == u.id, Order.payment_status == "approved").scalar() or 0.0
        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "created_at": u.created_at,
            "orders_count": orders_count,
            "total_spent": round(total_spent, 2)
        })
    return res

# --- GERENCIAMENTO DE CUPONS ---
@router.get("/coupons", response_model=List[dict])
def list_admin_coupons(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    coupons = db.query(Coupon).all()
    return [
        {
            "id": c.id,
            "code": c.code,
            "discount_type": c.discount_type,
            "discount_value": c.discount_value,
            "min_purchase": c.min_purchase,
            "usage_limit": c.usage_limit,
            "times_used": c.times_used,
            "is_active": c.is_active
        }
        for c in coupons
    ]

@router.post("/coupons")
def create_admin_coupon(
    code: str = Form(...),
    discount_type: str = Form("percentage"),
    discount_value: float = Form(...),
    min_purchase: float = Form(0.0),
    usage_limit: int = Form(1000),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    code_clean = code.upper().strip()
    if db.query(Coupon).filter(Coupon.code == code_clean).first():
        raise HTTPException(status_code=400, detail="Este código de cupom já existe.")

    coupon = Coupon(
        code=code_clean,
        discount_type=discount_type,
        discount_value=discount_value,
        min_purchase=min_purchase,
        usage_limit=usage_limit,
        is_active=True
    )
    db.add(coupon)
    db.commit()
    return {"message": f"Cupom '{code_clean}' criado com sucesso!"}
