import { NextResponse } from "next/server";
import crypto from "crypto";

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_DEFAULT_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is not configured.");
  }
  return secret;
}

/**
 * Creates a cryptographically signed admin session token.
 * Token format: base64(payload).signature
 */
export function createAdminToken(email: string): string {
  const secret = getAdminSecret();
  const payload = {
    email,
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

/**
 * Verifies if an admin token is valid and not expired.
 */
export function verifyToken(token: string): { valid: boolean; email?: string } {
  try {
    const secret = getAdminSecret();
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadStr)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    // Constant-time comparison to prevent timing attacks
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Parses cookies from Request header
 */
function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [k, ...v] = cookie.split("=");
    if (k.trim() === name) {
      return decodeURIComponent(v.join("="));
    }
  }
  return null;
}

/**
 * Verifies whether the incoming request is authorized as an admin.
 * Checks HTTP Authorization header, x-admin-token, or HTTP-only session cookie.
 */
export function verifyAdminSession(request: Request): boolean {
  // 1. Check Authorization: Bearer <token>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyToken(token).valid) return true;
  }

  // 2. Check custom x-admin-token header
  const customHeader = request.headers.get("x-admin-token");
  if (customHeader) {
    if (verifyToken(customHeader.trim()).valid) return true;
  }

  // 3. Check session cookie
  const cookieToken = getCookie(request, "crunchify_admin_session");
  if (cookieToken) {
    if (verifyToken(cookieToken.trim()).valid) return true;
  }

  return false;
}

/**
 * Standard unauthorized response for API routes
 */
export function unauthorizedResponse(message = "Unauthorized: Administrator authentication required") {
  return NextResponse.json({ error: message, success: false }, { status: 401 });
}
