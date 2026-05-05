/**
 * POST /api/auth/login
 * Login alternatif via username/password (bukan ESS).
 * Rate limit perlu diterapkan di WAF/nginx level.
 */

import { loginViaCredentials } from "@/lib/controllers/auth.controller";
import { sanitizeString } from "@/lib/security/crypto";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = sanitizeString(body.username ?? "");
    const password = body.password as string;
    const mfaToken = body.mfa_token as string | undefined;

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const result = await loginViaCredentials(username, password, mfaToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    if (result.requiresMfa) {
      return NextResponse.json({ requiresMfa: true, userId: result.userId }, { status: 200 });
    }

    // Issue CSRF token alongside auth cookie
    const csrfToken = randomBytes(32).toString("hex");
    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set("csrf_token", csrfToken, {
      httpOnly: false, // readable by JS so it can be put in headers
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
