/**
 * POST /api/admin/mfa/verify
 * Verify MFA token pada step 2 login Administrator.
 */

import { verifyMfaStep } from "@/lib/controllers/auth.controller";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.user_id ?? "").trim();
    const token  = String(body.token ?? "").replace(/\s/g, "");

    if (!userId || !token || token.length !== 6) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const result = await verifyMfaStep(userId, token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const csrfToken = randomBytes(32).toString("hex");
    const res = NextResponse.json({ success: true });
    res.cookies.set("csrf_token", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
