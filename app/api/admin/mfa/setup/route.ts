/**
 * POST /api/admin/mfa/setup
 * Generate TOTP secret + QR code untuk Administrator.
 */

import { generateMfaSecret } from "@/lib/security/mfa";
import { userRepository } from "@/lib/repositories/user.repository";
import { apiGuard } from "@/lib/security/rbac";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await apiGuard("admin:full");
  if (guard instanceof Response) return guard;

  const { session } = guard;

  try {
    const user = await userRepository.findByNik(session.nik);
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    if (!user.user_email) return NextResponse.json({ error: "Email belum diset" }, { status: 400 });

    const { encryptedSecret, qrDataUrl, otpauth } = await generateMfaSecret(user.user_email);
    await userRepository.updateMfaSecret(user.id, encryptedSecret);

    return NextResponse.json({
      success: true,
      qrDataUrl,
      otpauth,
      message: "Scan QR code dengan Google Authenticator atau Authy",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
