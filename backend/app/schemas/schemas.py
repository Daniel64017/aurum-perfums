import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# --- AUTH & USER ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- ADDRESS ---
class AddressBase(BaseModel):
    zip_code: str
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    is_default: bool = True

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- BRAND & CATEGORY ---
class BrandResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- PRODUCT IMAGE ---
class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    display_order: int

    class Config:
        from_attributes = True

# --- PRODUCT ---
class ProductBase(BaseModel):
    name: str
    brand_id: int
    category_id: int
    gender: str = "unissex"
    description: str
    volume_ml: int = 100
    concentration: str = "Eau de Parfum"
    olfactory_family: str
    top_notes: Optional[str] = None
    heart_notes: Optional[str] = None
    base_notes: Optional[str] = None
    price: float
    promotional_price: Optional[float] = None
    discount_percent: int = 0
    stock: int = 10
    sku: str
    status: str = "active"
    featured: bool = False
    release: bool = False
    bestseller: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    gender: Optional[str] = None
    description: Optional[str] = None
    volume_ml: Optional[int] = None
    concentration: Optional[str] = None
    olfactory_family: Optional[str] = None
    top_notes: Optional[str] = None
    heart_notes: Optional[str] = None
    base_notes: Optional[str] = None
    price: Optional[float] = None
    promotional_price: Optional[float] = None
    discount_percent: Optional[int] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    release: Optional[bool] = None
    bestseller: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    slug: str
    created_at: datetime.datetime
    brand: BrandResponse
    category: CategoryResponse
    images: List[ProductImageResponse] = []
    average_rating: float = 5.0
    review_count: int = 0

    class Config:
        from_attributes = True

# --- CART ---
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse] = []
    subtotal: float = 0.0

    class Config:
        from_attributes = True

# --- REVIEW ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime.datetime
    user_name: str

    class Config:
        from_attributes = True

# --- COUPON ---
class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float

class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    min_purchase: float
    is_active: bool

    class Config:
        from_attributes = True

# --- CHECKOUT & ORDER ---
class CheckoutRequest(BaseModel):
    shipping_address: AddressBase
    shipping_method: str  # "Normal", "Expressa", "Retirada"
    payment_method: str   # "pix", "credit_card", "debit_card", "boleto"
    coupon_code: Optional[str] = None
    card_details: Optional[dict] = None  # Apensas simulado

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    price: float
    quantity: int

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    method: str
    status: str
    transaction_id: str
    payload_json: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    discount_amount: float
    total: float
    payment_method: str
    shipping_address_json: str
    shipping_method: str
    tracking_code: Optional[str] = None
    created_at: datetime.datetime
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str  # received, paid, preparing, shipped, in_transit, delivered, cancelled

# --- ADMIN STATS ---
class AdminStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    total_products: int
    total_customers: int
    low_stock_products_count: int
    recent_sales: List[dict] = []
    top_selling_products: List[dict] = []
