export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface Address {
  id?: number;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default?: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  category_id: number;
  gender: 'masculino' | 'feminino' | 'unissex';
  description: string;
  volume_ml: number;
  concentration: string;
  olfactory_family: string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  price: number;
  promotional_price?: number;
  discount_percent: number;
  stock: number;
  sku: string;
  status: 'active' | 'draft' | 'out_of_stock';
  featured: boolean;
  release: boolean;
  bestseller: boolean;
  created_at: string;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  average_rating: number;
  review_count: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  item_subtotal: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
}

export interface PaymentDetails {
  sandbox_notice?: string;
  pix_copy_paste?: string;
  qr_code_mock?: string;
  card_brand?: string;
  last4?: string;
  installments?: string;
  barcode?: string;
  due_date?: string;
  instructions?: string;
}

export interface Payment {
  id: number;
  method: string;
  status: string;
  transaction_id: string;
  details?: PaymentDetails;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
  item_subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'received' | 'paid' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'approved' | 'refused' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  payment_method: 'pix' | 'credit_card' | 'debit_card' | 'boleto';
  shipping_address: Address;
  shipping_method: string;
  tracking_code?: string;
  created_at: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  total_products: number;
  total_customers: number;
  low_stock_products_count: number;
  recent_sales: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  top_selling_products: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
}
