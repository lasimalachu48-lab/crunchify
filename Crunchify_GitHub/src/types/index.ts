export type OrderStatus =
  | 'pending_payment'
  | 'payment_under_verification'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'collected'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'under_verification'
  | 'paid'
  | 'rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  category?: Category;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email?: string;
  phone_number: string;
  pickup_location: string;
  notes?: string | null;
  subtotal: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  upi_reference?: string | null;
  payment_screenshot_url?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CustomerUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  product_name?: string;
  change_amount: number;
  previous_stock: number;
  new_stock: number;
  reason: 'order_placed' | 'order_confirmed' | 'manual_adjustment' | 'restock' | 'cancelled_restock';
  order_id?: string;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  upi_id: string;
  payee_name: string;
  pickup_instructions: string;
  contact_number: string;
  opening_hours: string;
  banner_text: string;
  banner_active: boolean;
  min_order_amount: number;
  low_stock_threshold: number;
  hero_image_url?: string;
  hero_badge_text?: string;
  hero_card_title?: string;
  hero_card_subtitle?: string;
  hero_description?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  availableProducts: number;
  lowStockProducts: number;
  readyForPickup: number;
}

