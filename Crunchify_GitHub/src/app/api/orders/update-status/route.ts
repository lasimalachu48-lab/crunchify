import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db/store";
import { sendTelegramNotification } from "@/lib/telegram";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const result = await updateOrderStatus(orderId, status);
    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Status update failed" }, { status: 400 });
    }

    const order = result.order;

    if (status === "ready_for_pickup") {
      sendTelegramNotification("ORDER_READY", {
        orderReference: order.order_reference,
        customerName: order.customer_name,
        phoneNumber: order.phone_number,
        pickupLocation: order.pickup_location,
        totalAmount: order.total_amount,
        itemsSummary: "",
      }).catch((err) => console.error("Telegram notify failed:", err));
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
