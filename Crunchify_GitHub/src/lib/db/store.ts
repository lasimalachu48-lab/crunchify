import {
  Category,
  DashboardStats,
  InventoryLog,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  StoreSettings,
} from "@/types";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from "./seed-data";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { supabaseAdmin, isSupabaseAdminConfigured } from "../supabase/admin";
import { generateOrderReference } from "../utils";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".crunchify-data.json");
const TMP_DATA_FILE = path.join("/tmp", ".crunchify-data.json");

interface LocalStorageSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  settings: StoreSettings;
  logs: InventoryLog[];
}

function getLocalData(): LocalStorageSchema {
  try {
    const targetFile = fs.existsSync(TMP_DATA_FILE) ? TMP_DATA_FILE : DATA_FILE;
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.products || parsed.products.length === 0) {
        parsed.products = [...INITIAL_PRODUCTS];
      }
      if (!parsed.categories || parsed.categories.length === 0) {
        parsed.categories = [...INITIAL_CATEGORIES];
      }
      return parsed;
    }
  } catch (err) {
    // fallback
  }
  return {
    categories: [...INITIAL_CATEGORIES],
    products: [...INITIAL_PRODUCTS],
    orders: [],
    orderItems: [],
    settings: { ...INITIAL_STORE_SETTINGS },
    logs: [],
  };
}

function saveLocalData(data: LocalStorageSchema) {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(DATA_FILE, jsonStr, "utf-8");
  } catch (err) {
    try {
      fs.writeFileSync(TMP_DATA_FILE, jsonStr, "utf-8");
    } catch {
      // In read-only serverless environment without write permissions, state remains in memory
    }
  }
}

// In-Memory store initialized with persisted local data
let localState = getLocalData();
let memoryCategories: Category[] = localState.categories;
let memoryProducts: Product[] = localState.products;
let memoryOrders: Order[] = localState.orders;
let memoryOrderItems: OrderItem[] = localState.orderItems;
let memorySettings: StoreSettings = localState.settings;
let memoryLogs: InventoryLog[] = localState.logs;

function syncState() {
  localState = getLocalData();
  memoryCategories = localState.categories;
  memoryProducts = localState.products;
  memoryOrders = localState.orders;
  memoryOrderItems = localState.orderItems;
  memorySettings = localState.settings;
  memoryLogs = localState.logs;
}

function persistState() {
  saveLocalData({
    categories: memoryCategories,
    products: memoryProducts,
    orders: memoryOrders,
    orderItems: memoryOrderItems,
    settings: memorySettings,
    logs: memoryLogs,
  });
}

// Helper to check environment
const useSupabase = isSupabaseConfigured;
const useAdmin = isSupabaseAdminConfigured;

// -------------------------------------------------------------
// STORE SETTINGS
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  syncState();
  const dbClient = supabaseAdmin || supabase;
  if ((useAdmin || useSupabase) && dbClient) {
    try {
      const { data, error } = await dbClient
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (!error && data) return data as StoreSettings;
    } catch (err) {
      console.warn("Error fetching store_settings from Supabase, using fallback:", err);
    }
  }
  return memorySettings;
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  if (useAdmin && supabaseAdmin) {
    try {
      const { id: _ignoredId, updated_at: _ignoredUpdatedAt, ...cleanFields } = newSettings;
      void _ignoredId;
      void _ignoredUpdatedAt;

      const payload = {
        ...cleanFields,
        updated_at: new Date().toISOString(),
      };

      // Find the actual store_settings row ID in Supabase (seed.sql uses uuid_generate_v4)
      const { data: existingRow } = await supabaseAdmin
        .from("store_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      let result;
      if (existingRow?.id) {
        result = await supabaseAdmin
          .from("store_settings")
          .update(payload)
          .eq("id", existingRow.id)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from("store_settings")
          .insert(payload)
          .select()
          .single();
      }

      // If hero_* columns don't exist yet in user's Supabase schema, retry core columns
      if (result.error) {
        const {
          hero_image_url: _h1,
          hero_badge_text: _h2,
          hero_card_title: _h3,
          hero_card_subtitle: _h4,
          hero_description: _h5,
          ...corePayload
        } = payload;
        void _h1;
        void _h2;
        void _h3;
        void _h4;
        void _h5;

        if (existingRow?.id) {
          result = await supabaseAdmin
            .from("store_settings")
            .update(corePayload)
            .eq("id", existingRow.id)
            .select()
            .single();
        } else {
          result = await supabaseAdmin
            .from("store_settings")
            .insert(corePayload)
            .select()
            .single();
        }
      }

      if (!result.error && result.data) {
        memorySettings = {
          ...memorySettings,
          ...newSettings,
          ...(result.data as StoreSettings),
        };
        persistState();
        return memorySettings;
      }
      console.error("Supabase store_settings update error:", result.error);
    } catch (err) {
      console.warn("Error updating settings in Supabase:", err);
    }
  }

  memorySettings = {
    ...memorySettings,
    ...newSettings,
    updated_at: new Date().toISOString(),
  };
  persistState();
  return memorySettings;
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) return data as Category[];
    } catch (err) {
      console.warn("Error fetching categories from Supabase, using fallback:", err);
    }
  }
  return memoryCategories;
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
  activeOnly?: boolean;
}): Promise<Product[]> {
  syncState();
  const { categoryId, search, featuredOnly, activeOnly = true } = options || {};

  if (useSupabase && supabase) {
    try {
      let query = supabase.from("products").select("*, category:categories(*)");
      if (activeOnly) query = query.eq("is_active", true);
      if (featuredOnly) query = query.eq("is_featured", true);
      if (categoryId && categoryId !== "all") query = query.eq("category_id", categoryId);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data as Product[];
    } catch (err) {
      console.warn("Error fetching products from Supabase, using fallback:", err);
    }
  }

  let list = [...memoryProducts];
  if (activeOnly) {
    list = list.filter((p) => p.is_active);
  }
  if (featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }
  if (categoryId && categoryId !== "all") {
    list = list.filter((p) => p.category_id === categoryId);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Populate category info
  return list.map((p) => ({
    ...p,
    category: memoryCategories.find((c) => c.id === p.category_id),
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data as Product;
    } catch (err) {
      console.warn("Error fetching product by ID from Supabase:", err);
    }
  }
  const item = memoryProducts.find((p) => p.id === id);
  if (!item) return null;
  return {
    ...item,
    category: memoryCategories.find((c) => c.id === item.category_id),
  };
}

export async function createProduct(payload: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const newProduct: Product = {
    ...payload,
    id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (useAdmin && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .insert({
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          category_id: payload.category_id,
          image_url: payload.image_url,
          is_featured: payload.is_featured,
          is_active: payload.is_active,
          tags: payload.tags,
        })
        .select()
        .single();
      if (!error && data) {
        memoryProducts.unshift(data as Product);
        return data as Product;
      }
    } catch (err) {
      console.warn("Error creating product in Supabase:", err);
    }
  }

  memoryProducts.unshift(newProduct);
  persistState();
  return newProduct;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product | null> {
  if (useAdmin && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        const idx = memoryProducts.findIndex((p) => p.id === id);
        if (idx !== -1) memoryProducts[idx] = data as Product;
        return data as Product;
      }
    } catch (err) {
      console.warn("Error updating product in Supabase:", err);
    }
  }

  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = {
    ...memoryProducts[idx],
    ...payload,
    updated_at: new Date().toISOString(),
  };
  memoryProducts[idx] = updated;
  persistState();
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (useAdmin && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
      if (!error) {
        memoryProducts = memoryProducts.filter((p) => p.id !== id);
        return true;
      }
    } catch (err) {
      console.warn("Error deleting product from Supabase:", err);
    }
  }
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  persistState();
  return true;
}

// -------------------------------------------------------------
// INVENTORY & STOCK
// -------------------------------------------------------------
export async function adjustStock(
  productId: string,
  newStock: number,
  reason: InventoryLog["reason"],
  orderId?: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const product = await getProductById(productId);
  if (!product) return { success: false, error: "Product not found" };

  const previousStock = product.stock;
  const changeAmount = newStock - previousStock;
  const clampedStock = Math.max(0, newStock);

  const updated = await updateProduct(productId, { stock: clampedStock });
  if (!updated) return { success: false, error: "Failed to update stock" };

  const log: InventoryLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    product_id: productId,
    product_name: product.name,
    change_amount: changeAmount,
    previous_stock: previousStock,
    new_stock: clampedStock,
    reason,
    order_id: orderId,
    created_at: new Date().toISOString(),
  };

  if (useAdmin && supabaseAdmin) {
    try {
      await supabaseAdmin.from("inventory_logs").insert({
        product_id: productId,
        change_amount: changeAmount,
        previous_stock: previousStock,
        new_stock: clampedStock,
        reason,
        order_id: orderId,
      });
    } catch (err) {
      console.warn("Error logging inventory in Supabase:", err);
    }
  }
  memoryLogs.unshift(log);
  persistState();

  return { success: true, product: updated };
}

export async function getInventoryLogs(limit = 50): Promise<InventoryLog[]> {
  if (useAdmin && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("inventory_logs")
        .select("*, product:products(name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) {
        return data.map((d) => ({
          ...d,
          product_name: d.product?.name || "Unknown Product",
        })) as InventoryLog[];
      }
    } catch (err) {
      console.warn("Error fetching logs from Supabase:", err);
    }
  }
  return memoryLogs.slice(0, limit);
}

// -------------------------------------------------------------
// ORDERS & CHECKOUT (Server-Side Price & Stock Verification)
// -------------------------------------------------------------
export interface CreateOrderInput {
  customer_name: string;
  customer_email?: string;
  phone_number: string;
  pickup_location: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export async function createOrder(
  input: CreateOrderInput
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const { customer_name, customer_email, phone_number, pickup_location, notes, items } = input;

  if (!customer_name?.trim()) return { success: false, error: "Customer name is required." };
  if (!phone_number?.trim() || phone_number.trim().length < 10) {
    return { success: false, error: "A valid 10-digit phone number is required." };
  }
  if (!pickup_location?.trim()) {
    return { success: false, error: "Room number or pickup identification is required." };
  }
  if (!items || items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  // Validate prices & stock strictly on the server
  let subtotal = 0;
  const verifiedOrderItems: OrderItem[] = [];

  for (const item of items) {
    const product = await getProductById(item.product_id);
    if (!product) {
      return { success: false, error: `Product ID ${item.product_id} no longer exists.` };
    }
    if (!product.is_active) {
      return { success: false, error: `"${product.name}" is currently unavailable.` };
    }
    if (product.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
      };
    }

    const itemTotal = Number(product.price) * item.quantity;
    subtotal += itemTotal;

    verifiedOrderItems.push({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: item.quantity,
      total_price: itemTotal,
      product,
    });
  }

  const settings = await getStoreSettings();
  if (subtotal < settings.min_order_amount) {
    return {
      success: false,
      error: `Minimum order amount is ₹${settings.min_order_amount}. Current subtotal: ₹${subtotal}.`,
    };
  }

  const orderReference = generateOrderReference();
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const orderData: Order = {
    id: orderId,
    order_reference: orderReference,
    customer_name: customer_name.trim(),
    customer_email: customer_email?.trim().toLowerCase() || "",
    phone_number: phone_number.trim(),
    pickup_location: pickup_location.trim(),
    notes: notes?.trim() || "",
    subtotal,
    total_amount: subtotal,
    status: "pending_payment",
    payment_status: "unpaid",
    created_at: now,
    updated_at: now,
    items: verifiedOrderItems,
  };

  if (useSupabase && supabase) {
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_reference: orderReference,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          phone_number: orderData.phone_number,
          pickup_location: orderData.pickup_location,
          notes: orderData.notes,
          subtotal: orderData.subtotal,
          total_amount: orderData.total_amount,
          status: "pending_payment",
          payment_status: "unpaid",
        })
        .select()
        .single();

      if (!orderErr && dbOrder) {
        // Insert order items
        const itemsToInsert = verifiedOrderItems.map((item) => ({
          order_id: dbOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          total_price: item.total_price,
        }));
        await supabase.from("order_items").insert(itemsToInsert);

        const fullOrder: Order = {
          ...dbOrder,
          items: verifiedOrderItems,
        };
        memoryOrders.unshift(fullOrder);
        return { success: true, order: fullOrder };
      }
    } catch (err) {
      console.warn("Error inserting order to Supabase, saving to memory:", err);
    }
  }

  memoryOrders.unshift(orderData);
  verifiedOrderItems.forEach((it) => {
    memoryOrderItems.push({ ...it, order_id: orderId });
  });
  persistState();

  return { success: true, order: orderData };
}

export async function getOrderByReference(orderReference: string): Promise<Order | null> {
  syncState();
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("order_reference", orderReference.trim().toUpperCase())
        .maybeSingle();
      if (!error && data) return data as Order;
    } catch (err) {
      console.warn("Error fetching order by reference from Supabase:", err);
    }
  }

  const order = memoryOrders.find(
    (o) => o.order_reference.toUpperCase() === orderReference.trim().toUpperCase()
  );
  if (!order) return null;

  const items = memoryOrderItems.filter((i) => i.order_id === order.id);
  return {
    ...order,
    items: items.length > 0 ? items : order.items || [],
  };
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  syncState();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return [];

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .ilike("customer_email", cleanEmail)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Order[];
    } catch (err) {
      console.warn("Error fetching customer orders from Supabase:", err);
    }
  }

  const matchingOrders = memoryOrders.filter(
    (o) => (o.customer_email || "").toLowerCase() === cleanEmail
  );

  return matchingOrders.map((ord) => {
    const items = memoryOrderItems.filter((i) => i.order_id === ord.id);
    return {
      ...ord,
      items: items.length > 0 ? items : ord.items || [],
    };
  });
}

export async function submitPaymentProof(
  orderReference: string,
  payload: {
    upiReference: string;
    screenshotUrl?: string;
  }
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const order = await getOrderByReference(orderReference);
  if (!order) return { success: false, error: "Order not found" };

  const updateFields = {
    upi_reference: payload.upiReference.trim(),
    payment_screenshot_url: payload.screenshotUrl || order.payment_screenshot_url,
    status: "payment_under_verification" as OrderStatus,
    payment_status: "under_verification" as PaymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("order_reference", orderReference)
        .select("*, items:order_items(*)")
        .single();
      if (!error && data) {
        const idx = memoryOrders.findIndex((o) => o.id === order.id);
        if (idx !== -1) memoryOrders[idx] = data as Order;
        return { success: true, order: data as Order };
      }
    } catch (err) {
      console.warn("Error updating payment proof in Supabase:", err);
    }
  }

  const updatedOrder: Order = {
    ...order,
    ...updateFields,
  };
  const idx = memoryOrders.findIndex((o) => o.id === order.id);
  if (idx !== -1) memoryOrders[idx] = updatedOrder;
  persistState();

  return { success: true, order: updatedOrder };
}

export async function getAllOrders(): Promise<Order[]> {
  syncState();
  if (useAdmin && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Order[];
    } catch (err) {
      console.warn("Error getting all orders from Supabase:", err);
    }
  }
  return memoryOrders;
}

export async function verifyPayment(
  orderId: string,
  decision: "approve" | "reject",
  rejectionReason?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const all = await getAllOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return { success: false, error: "Order not found" };

  if (decision === "approve") {
    // 1. Mark confirmed and paid
    const updatedStatus: OrderStatus = "confirmed";
    const updatedPayment: PaymentStatus = "paid";

    // 2. Reduce stock for confirmed products and record inventory logs
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const prod = await getProductById(item.product_id);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await adjustStock(item.product_id, newStock, "order_confirmed", order.id);
        }
      }
    }

    const fields = {
      status: updatedStatus,
      payment_status: updatedPayment,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    if (useAdmin && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update(fields)
          .eq("id", orderId)
          .select("*, items:order_items(*)")
          .single();
        if (!error && data) {
          const idx = memoryOrders.findIndex((o) => o.id === orderId);
          if (idx !== -1) memoryOrders[idx] = data as Order;
          return { success: true, order: data as Order };
        }
      } catch (err) {
        console.warn("Error verifying payment in Supabase:", err);
      }
    }

    const updated = { ...order, ...fields };
    const idx = memoryOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) memoryOrders[idx] = updated;
    persistState();
    return { success: true, order: updated };
  } else {
    // Reject
    const fields = {
      status: "cancelled" as OrderStatus,
      payment_status: "rejected" as PaymentStatus,
      rejection_reason: rejectionReason || "Payment verification failed or UTR mismatch.",
      updated_at: new Date().toISOString(),
    };

    if (useAdmin && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update(fields)
          .eq("id", orderId)
          .select("*, items:order_items(*)")
          .single();
        if (!error && data) {
          const idx = memoryOrders.findIndex((o) => o.id === orderId);
          if (idx !== -1) memoryOrders[idx] = data as Order;
          return { success: true, order: data as Order };
        }
      } catch (err) {
        console.warn("Error rejecting payment in Supabase:", err);
      }
    }

    const updated = { ...order, ...fields };
    const idx = memoryOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) memoryOrders[idx] = updated;
    persistState();
    return { success: true, order: updated };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const all = await getAllOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return { success: false, error: "Order not found" };

  // If transitioning to cancelled after being confirmed, restore stock
  if (newStatus === "cancelled" && (order.status === "confirmed" || order.status === "preparing" || order.status === "ready_for_pickup")) {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const prod = await getProductById(item.product_id);
        if (prod) {
          await adjustStock(item.product_id, prod.stock + item.quantity, "cancelled_restock", order.id);
        }
      }
    }
  }

  const fields = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (useAdmin && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update(fields)
        .eq("id", orderId)
        .select("*, items:order_items(*)")
        .single();
      if (!error && data) {
        const idx = memoryOrders.findIndex((o) => o.id === orderId);
        if (idx !== -1) memoryOrders[idx] = data as Order;
        return { success: true, order: data as Order };
      }
    } catch (err) {
      console.warn("Error updating status in Supabase:", err);
    }
  }

  const updated = { ...order, ...fields };
  const idx = memoryOrders.findIndex((o) => o.id === orderId);
  if (idx !== -1) memoryOrders[idx] = updated;
  persistState();
  return { success: true, order: updated };
}

// -------------------------------------------------------------
// DASHBOARD ANALYTICS
// -------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  syncState();
  const orders = await getAllOrders();
  const products = await getProducts({ activeOnly: false });
  const settings = await getStoreSettings();

  const paidStatuses: OrderStatus[] = ["confirmed", "preparing", "ready_for_pickup", "collected"];

  const totalSales = orders
    .filter((o) => paidStatuses.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending_payment" || o.status === "payment_under_verification"
  ).length;

  const lowStockThreshold = settings.low_stock_threshold || 5;
  const lowStockProducts = products.filter((p) => p.is_active && p.stock <= lowStockThreshold).length;
  const readyForPickup = orders.filter((o) => o.status === "ready_for_pickup").length;

  return {
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    availableProducts: products.filter((p) => p.is_active && p.stock > 0).length,
    lowStockProducts,
    readyForPickup,
  };
}

