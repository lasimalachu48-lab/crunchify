# 🍿 CRUNCHIFY — Local Snack & Chips Ordering Platform

> **"Your Cravings. Just One Click Away."**

CRUNCHIFY is a mini e-commerce platform built for local snack, chips, chocolate, noodle, and cold beverage ordering. Customers place snack orders online, pay directly via **UPI QR code or Deep Link**, and pick up their snacks physically from the owner's room (Room 204).

---

## 🚀 Quick Access

- **Customer Storefront:** [http://localhost:3000](http://localhost:3000)
- **Snack Catalogue:** [http://localhost:3000/catalogue](http://localhost:3000/catalogue)
- **Order Tracking:** [http://localhost:3000/track](http://localhost:3000/track)
- **Admin Control Room:** [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Master Password:** `CrunchifyAdmin@2025` *(or `admin123`)*

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling & Design System:** Tailwind CSS
  - Warm cream background palette (`#FCFBF8`, `#F8F3EA`)
  - Vibrant snack orange primary (`#FF5C00`)
  - Deep spicy red secondary (`#B91C1C`)
  - Rounded cards, clean typography & micro-interactions
- **Animations:** Framer Motion
- **Database & Storage:** Supabase PostgreSQL & Supabase Storage (with local persistence fallback)
- **UPI QR & Deep Link Engine:** `qrcode.react` with standard NPCI UPI specification
- **Audio Alerts:** Web Audio API synthesized notification chimes
- **Notifications:** Telegram Bot API (server-side environment variables) + Browser Notifications

---

## 📦 Key Features

### 1. Customer Shopping Experience
- **Homepage:** Animated hero section, trending munchies, curated value bundles (Midnight Gamer Bundle, Exam Survival Kit), and 3-step physical pickup explainer.
- **Snack Catalogue:** Category filters (Chips & Crisps, Instant Noodles, Chocolates & Sweets, Cold Beverages, Biscuits & Cookies, Midnight Combos), live search, sort options, and out-of-stock badges.
- **Interactive Shopping Bag (Cart):** Slide-out drawer with quantity controls, subtotal calculation, minimum order amount enforcement, and **strict stock boundary prevention** (cannot order more than available inventory).
- **Checkout:** Collects customer name, 10-digit phone number, room number/pickup ID, and optional notes.
- **Physical Pickup Guarantee:** Reminds customers that this is a room pickup business with zero delivery delays or surge fees.

### 2. UPI Payment Workflow
- **Initial UPI ID:** Configured as `7736190495@ptsbi` (editable via Admin Settings).
- **Dynamic QR Code:** Generates NPCI-compliant deep links and crisp QR codes with payee name, exact order amount, currency (INR), and unique order reference (`CRUNCH-XXXX`).
- **Direct App Intent:** 1-click button to open installed UPI apps (GPay, PhonePe, Paytm, Cred, BHIM) on mobile.
- **Manual Verification Security:** Orders are created with `pending_payment`. Customers enter their 12-digit UPI UTR reference and optional screenshot. The order enters `payment_under_verification` until the owner manually approves it.

### 3. Live Order Tracking
- Stepper milestones: *Pending Payment → Verifying Payment → Confirmed → Packing Snacks → Ready for Pickup! → Collected*.
- Shows room number, phone number, and knocking instructions when snacks are packed.
- Celebratory confetti burst when order is confirmed or ready for pickup.

### 4. Admin Dashboard (`/admin`)
- **Protected Portal:** Master password authentication guard.
- **Analytics Overview:** Live total sales (₹), order count, pending verifications, active products, and low-stock alerts.
- **Order Management:** Filter by stage, view customer room and phone, preview payment screenshots, copy UTR, approve payment (which automatically deducts inventory), or reject with reason.
- **Product Management:** Add, edit, delete snacks, upload images, set featured tags, adjust prices and stock.
- **Inventory Audit Trail:** Real-time stock logger recording previous stock, new stock, and reason for every change.
- **Store Settings:** Live modification of store name, tagline, UPI ID, payee name, pickup instructions, contact phone, operating hours, and promotional banner.
- **Real-Time Sound Alerts:** Notification chime triggered on incoming orders.

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the schema file:
   - Copy contents of `supabase/schema.sql` and click **Run**.
4. Run the seed data file:
   - Copy contents of `supabase/seed.sql` and click **Run**.
5. Add your credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
*(Note: If Supabase keys are not set, CRUNCHIFY seamlessly uses its local persistent storage layer so the app is 100% functional immediately.)*

---

## 🔔 Telegram Notifications (Optional)

To receive instant Telegram alerts on your phone whenever a customer places an order or submits a UTR:
1. Message `@BotFather` on Telegram and create a bot to get your `TELEGRAM_BOT_TOKEN`.
2. Get your numeric chat ID from `@userinfobot`.
3. Add to `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=your_chat_id
   ```
*(Telegram tokens are strictly server-side and never exposed to the client.)*

---

## 🚢 Free-Tier Deployment (Vercel)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Under Environment Variables, add:
   - `NEXT_PUBLIC_DEFAULT_UPI_ID=7736190495@ptsbi`
   - `ADMIN_DEFAULT_PASSWORD=CrunchifyAdmin@2025`
   - (Optional) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - (Optional) `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
4. Click **Deploy**. Your mini snack e-commerce platform is live worldwide!

