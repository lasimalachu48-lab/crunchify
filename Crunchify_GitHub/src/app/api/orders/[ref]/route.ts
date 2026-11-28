import { NextResponse } from "next/server";
import { getOrderByReference, submitPaymentProof } from "@/lib/db/store";
import { validateUtr } from "@/lib/upi";
import { sendTelegramNotification } from "@/lib/telegram";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    if (!ref) {
      return NextResponse.json({ error: "Order reference is required" }, { status: 400 });
    }

    const order = await getOrderByReference(ref);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    const body = await request.json();
    const { upiReference, screenshotUrl } = body;

    const utrCheck = validateUtr(upiReference || "");
    if (!utrCheck.isValid) {
      return NextResponse.json({ error: utrCheck.message }, { status: 400 });
    }

    const result = await submitPaymentProof(ref, {
      upiReference,
      screenshotUrl,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Failed to update payment proof" }, { status: 400 });
    }

    const order = result.order;

    // Send Telegram alert that UTR has been submitted and is ready for admin check
    sendTelegramNotification("PAYMENT_SUBMITTED", {
      orderReference: order.order_reference,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      pickupLocation: order.pickup_location,
      totalAmount: order.total_amount,
      itemsSummary: "",
      upiReference,
    }).catch((err) => console.error("Telegram notify failed:", err));

    return NextResponse.json({
      success: true,
      order,
      message: "Payment reference submitted successfully. The administrator will verify shortly.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit payment reference" }, { status: 500 });
  }
}

