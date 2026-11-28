import { NextResponse } from "next/server";
import { adjustStock, getInventoryLogs } from "@/lib/db/store";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const logs = await getInventoryLogs(100);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { productId, newStock, reason } = body;

    if (!productId || newStock === undefined || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await adjustStock(productId, Number(newStock), reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}
