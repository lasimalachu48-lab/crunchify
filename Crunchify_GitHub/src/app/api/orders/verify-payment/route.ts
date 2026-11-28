import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/db/store";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { orderId, decision, rejectionReason } = body;

    if (!orderId || !decision) {
      return NextResponse.json({ error: "Order ID and decision ('approve' | 'reject') are required" }, { status: 400 });
    }

    const result = await verifyPayment(orderId, decision, rejectionReason);
    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Payment verification failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process payment verification" }, { status: 500 });
  }
}
