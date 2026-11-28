import { NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings, getCategories } from "@/lib/db/store";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [settings, categories] = await Promise.all([
      getStoreSettings(),
      getCategories(),
    ]);
    return NextResponse.json(
      { settings, categories },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const updated = await updateStoreSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
