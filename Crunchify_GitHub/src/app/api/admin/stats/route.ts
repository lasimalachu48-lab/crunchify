import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db/store";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
