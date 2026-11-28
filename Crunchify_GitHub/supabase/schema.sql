-- =====================================================================
-- CRUNCHIFY DATABASE SCHEMA
-- Mini E-Commerce Platform for Snacks & Chips (Pickup Model)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM (
        'pending_payment',
        'payment_under_verification',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'collected',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'unpaid',
        'under_verification',
        'paid',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'admin',
        'customer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Supabase Auth Integration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role user_role_type NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    phone_number TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status order_status_type NOT NULL DEFAULT 'pending_payment',
    payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
    upi_reference TEXT,
    payment_screenshot_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL DEFAULT 'CRUNCHIFY',
    tagline TEXT NOT NULL DEFAULT 'Your Cravings. Just One Click Away.',
    upi_id TEXT NOT NULL DEFAULT '7736190495@ptsbi',
    payee_name TEXT NOT NULL DEFAULT 'CRUNCHIFY SNACKS',
    pickup_instructions TEXT NOT NULL DEFAULT 'Room 1246, B Block - Knock or call on arrival for instant handoff!',
    contact_number TEXT NOT NULL DEFAULT '+91 7736190495',
    opening_hours TEXT NOT NULL DEFAULT '5:00 PM – 2:30 AM Daily',
    banner_text TEXT NOT NULL DEFAULT '🔥 Late night cravings? Order online, pay via UPI, and pick up in 2 mins!',
    banner_active BOOLEAN NOT NULL DEFAULT true,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1000&q=80',
    hero_badge_text TEXT DEFAULT 'Fresh Restock',
    hero_card_title TEXT DEFAULT 'Doritos & Chilled Sodas',
    hero_card_subtitle TEXT DEFAULT 'Ready in the cooler right now',
    hero_description TEXT DEFAULT 'Order hot Maggi, crispy Doritos, icy cold drinks, and sweet chocolates. Pay directly via UPI and pick up instantly from Room 1246.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories RLS
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products RLS
CREATE POLICY "Allow public read active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin manage products" ON public.products FOR ALL USING (public.is_admin());

-- Store Settings RLS
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin manage store_settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- Orders RLS
CREATE POLICY "Allow public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order by reference" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update order payment proof" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin manage all orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items RLS
CREATE POLICY "Allow public insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow admin manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Inventory Logs RLS
CREATE POLICY "Allow admin view inventory logs" ON public.inventory_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow server insert inventory logs" ON public.inventory_logs FOR INSERT WITH CHECK (true);

-- 11. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

