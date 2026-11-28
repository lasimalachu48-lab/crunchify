import { NextResponse } from "next/server";
import { createAdminToken, verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAuth = verifyAdminSession(request);
  if (!isAuth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, role: "admin" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, provider, action } = body;

    // Handle logout action
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out" });
      response.cookies.set("crunchify_admin_session", "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    const rawEmail = process.env.ADMIN_AUTHORIZED_EMAIL;
    const rawPassword = process.env.ADMIN_DEFAULT_PASSWORD;

    if (!rawEmail || !rawPassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server missing ADMIN_AUTHORIZED_EMAIL or ADMIN_DEFAULT_PASSWORD in Environment Variables.",
        },
        { status: 500 }
      );
    }

    const authorizedEmail = rawEmail.trim().toLowerCase();
    const authorizedPassword = rawPassword.trim();

    // 1. Google Sign-In Provider
    if (provider === "google") {
      // If external Google OAuth token is verified or Google OAuth is configured:
      // Note: Full server-side Google OAuth requires GOOGLE_CLIENT_ID configuration.
      // To prevent unauthorized account takeover, unverified simulation is strictly disabled.
      return NextResponse.json(
        {
          success: false,
          error:
            "Google OAuth sign-in requires GOOGLE_CLIENT_ID environment variable setup. Please use your Administrator Password to sign in.",
        },
        { status: 403 }
      );
    }

    // 2. Email + Password Sign-In
    const inputEmail = (email || "").trim().toLowerCase();
    const inputPassword = password || "";

    if (
      inputEmail === authorizedEmail &&
      inputPassword === authorizedPassword
    ) {
      const token = createAdminToken(authorizedEmail);

      const response = NextResponse.json({
        success: true,
        token,
        email: authorizedEmail,
        role: "admin",
      });

      // Secure HTTP-Only Cookie (use secure flag over HTTPS)
      const isHttps =
        request.headers.get("x-forwarded-proto") === "https" ||
        request.url.startsWith("https://");
      response.cookies.set("crunchify_admin_session", token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    if (inputEmail !== authorizedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: This account is not authorized for administrator access.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Incorrect administrator password." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication server error." },
      { status: 500 }
    );
  }
}
