-- =====================================================================
-- CRUNCHIFY SEED DATA
-- Categories, Products, and Initial Store Settings
-- =====================================================================

-- 1. Insert Initial Store Settings
INSERT INTO public.store_settings (
    store_name,
    tagline,
    upi_id,
    payee_name,
    pickup_instructions,
    contact_number,
    opening_hours,
    banner_text,
    banner_active,
    min_order_amount,
    low_stock_threshold
) VALUES (
    'CRUNCHIFY',
    'Your Cravings. Just One Click Away.',
    '7736190495@ptsbi',
    'CRUNCHIFY SNACKS',
    '📍 Pickup Location: Room 1246, B Block. Knock or ring doorbell. Instant pickup in under 2 minutes!',
    '+91 7736190495',
    'Open Daily: 5:00 PM – 2:30 AM',
    '🔥 Midnight Munchies Alert: Fresh stock of chips, chilled drinks & Maggi ready for pickup!',
    true,
    10.00,
    5
) ON CONFLICT DO NOTHING;

-- 2. Insert Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Chips & Crisps', 'chips-crisps', 'Sparkles', 1),
('c1000000-0000-0000-0000-000000000002', 'Instant Noodles', 'instant-noodles', 'Flame', 2),
('c1000000-0000-0000-0000-000000000003', 'Chocolates & Sweets', 'chocolates-sweets', 'Heart', 3),
('c1000000-0000-0000-0000-000000000004', 'Cold Beverages', 'cold-beverages', 'Coffee', 4),
('c1000000-0000-0000-0000-000000000005', 'Biscuits & Cookies', 'biscuits-cookies', 'Cookie', 5),
('c1000000-0000-0000-0000-000000000006', 'Midnight Combos', 'combos', 'Zap', 6)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (id, name, slug, description, price, stock, category_id, image_url, is_featured, is_active, tags) VALUES
-- Chips & Crisps
(
    'p1000000-0000-0000-0000-000000000001',
    'Doritos Nacho Cheese (115g)',
    'doritos-nacho-cheese',
    'Intense cheesy crunch with bold tortilla flavour. Perfect for movie nights or gaming sessions.',
    50.00,
    24,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Bestseller', 'Cheesy', 'Crunchy']
),
(
    'p1000000-0000-0000-0000-000000000002',
    'Lay''s Spanish Tomato Tango (50g)',
    'lays-spanish-tomato-tango',
    'Classic crispy potato chips tossed in sweet, tangy Spanish tomato seasoning.',
    20.00,
    30,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Popular', 'Tangy']
),
(
    'p1000000-0000-0000-0000-000000000003',
    'Kurkure Masala Munch (82g)',
    'kurkure-masala-munch',
    'India''s favourite chatpata twisty bite loaded with authentic spices.',
    20.00,
    18,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Spicy', 'Desi']
),
(
    'p1000000-0000-0000-0000-000000000004',
    'Pringles Sour Cream & Onion (107g)',
    'pringles-sour-cream-onion',
    'Stacked crisps with irresistible savoury tangy cream goodness in a resealable can.',
    115.00,
    8,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Premium', 'Imported']
),

-- Instant Noodles
(
    'p1000000-0000-0000-0000-000000000005',
    'Maggi 2-Minute Masala Noodles (70g)',
    'maggi-2-minute-masala',
    'The legendary midnight snack. Ready to cook or carry to your electric kettle.',
    14.00,
    45,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Midnight Essential', 'Hot']
),
(
    'p1000000-0000-0000-0000-000000000006',
    'Nissin Cup Noodles Spicy Veg (70g)',
    'nissin-cup-noodles-spicy-veg',
    'Fork included! Just pour hot water and enjoy instant spicy noodles in 3 minutes.',
    50.00,
    15,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Instant', 'Spicy']
),
(
    'p1000000-0000-0000-0000-000000000007',
    'Wai Wai Ready-To-Eat Noodles (70g)',
    'wai-wai-ready-to-eat',
    'Crunchy fried noodles with taste enhancer & roasted onion oil. Eat raw or cooked!',
    20.00,
    20,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1594834749740-74b3f6764be4?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Quick Snack']
),

-- Chocolates & Sweets
(
    'p1000000-0000-0000-0000-000000000008',
    'Cadbury Dairy Milk Silk (60g)',
    'cadbury-dairy-milk-silk',
    'Rich, smooth and velvety milk chocolate that melts into pure bliss.',
    85.00,
    16,
    'c1000000-0000-0000-0000-000000000003',
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Sweet', 'Bestseller']
),
(
    'p1000000-0000-0000-0000-000000000009',
    'KitKat 4-Finger Crisp Bar (37.5g)',
    'kitkat-4-finger-crisp',
    'Crisp wafer fingers enrobed in milk chocolate. Have a break, have a KitKat.',
    30.00,
    25,
    'c1000000-0000-0000-0000-000000000003',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Wafer', 'Sweet']
),
(
    'p1000000-0000-0000-0000-000000000010',
    'Snickers Peanut Energy Bar (50g)',
    'snickers-peanut-bar',
    'Packed with roasted peanuts, rich caramel and chewy nougat covered in milk chocolate.',
    50.00,
    12,
    'c1000000-0000-0000-0000-000000000003',
    'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Nutty', 'Energy']
),

-- Cold Beverages
(
    'p1000000-0000-0000-0000-000000000011',
    'Coca-Cola Can Chilled (300ml)',
    'coca-cola-can-300ml',
    'Ice cold, crisp and refreshing classic soda directly from the chiller.',
    40.00,
    22,
    'c1000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Chilled', 'Bestseller']
),
(
    'p1000000-0000-0000-0000-000000000012',
    'Red Bull Energy Drink (250ml)',
    'red-bull-energy-drink',
    'Vitalizes body and mind for late night study, coding or gaming marathons.',
    125.00,
    10,
    'c1000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['High Energy', 'Premium']
),
(
    'p1000000-0000-0000-0000-000000000013',
    'Sting Energy Blue Current (250ml)',
    'sting-energy-drink',
    'Electrifying berry energy rush with refreshing carbonated kick.',
    20.00,
    30,
    'c1000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Budget', 'Energy']
),

-- Biscuits & Cookies
(
    'p1000000-0000-0000-0000-000000000014',
    'Dark Fantasy Choco Fills (75g)',
    'dark-fantasy-choco-fills',
    'Crisp baked crust bursting with luscious molten molten chocolate core.',
    40.00,
    14,
    'c1000000-0000-0000-0000-000000000005',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Choco Filled', 'Indulgent']
),
(
    'p1000000-0000-0000-0000-000000000015',
    'Oreo Vanilla Creme Biscuits (120g)',
    'oreo-vanilla-creme',
    'Rich dark cocoa biscuits stuffed with silky sweet vanilla cream.',
    35.00,
    18,
    'c1000000-0000-0000-0000-000000000005',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    false,
    true,
    ARRAY['Sweet', 'Dunkable']
),

-- Midnight Combos
(
    'p1000000-0000-0000-0000-000000000016',
    'Midnight Gamer Bundle',
    'midnight-gamer-bundle',
    'Includes: 1x Red Bull (250ml) + 1x Doritos Nacho Cheese (115g) + 1x KitKat Bar. Save ₹15!',
    190.00,
    6,
    'c1000000-0000-0000-0000-000000000006',
    'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Combo Deal', 'Special Offer', 'Save ₹15']
),
(
    'p1000000-0000-0000-0000-000000000017',
    'Hostel Exam Survival Kit',
    'hostel-exam-survival-kit',
    'Includes: 2x Maggi Masala Noodles + 1x Coca-Cola Can + 1x Dairy Milk Silk + 1x Kurkure Masala Munch. Ultimate fuel!',
    160.00,
    5,
    'c1000000-0000-0000-0000-000000000006',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    true,
    true,
    ARRAY['Combo Deal', 'Exam Special', 'Value Pack']
)
ON CONFLICT (slug) DO NOTHING;

