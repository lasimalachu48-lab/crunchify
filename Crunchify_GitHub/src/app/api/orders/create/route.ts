import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db/store";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createOrder({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      phone_number: body.phone_number,
      pickup_location: body.pickup_location,
      notes: body.notes,
      items: body.items,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Failed to create order" }, { status: 400 });
    }

    const order = result.order;

    // Build items summary for notification
    const itemsSummary = (order.items || [])
      .map((item) => `• ${item.quantity}x ${item.product_name} (₹${item.total_price})`)
      .join("\n");

    // Asynchronously dispatch Telegram notification without blocking checkout flow
    sendTelegramNotification("NEW_ORDER", {
      orderReference: order.order_reference,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      pickupLocation: order.pickup_location,
      totalAmount: order.total_amount,
      itemsSummary,
      notes: order.notes,
    }).catch((err) => console.error("Telegram notify failed:", err));

    return NextResponse.json({
      success: true,
      order,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error during order creation" }, { status: 500 });
  }
}

