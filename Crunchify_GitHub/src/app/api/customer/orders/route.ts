import { NextResponse } from "next/server";
import { getOrdersByCustomerEmail } from "@/lib/db/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    const orders = await getOrdersByCustomerEmail(email);
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer orders" }, { status: 500 });
  }
}

