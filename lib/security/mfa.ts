/**
 * SECURITY — MFA (TOTP) untuk Administrator
 * Menggunakan otplib untuk TOTP standard (RFC 6238).
 * Secret disimpan terenkripsi di DB via AES-256-GCM.
 */

import { encryptSensitive, decryptSensitive } from "./crypto";

// ─── TOTP via otplib ─────────────────────────────
// Requires: npm install otplib qrcode
export async function generateMfaSecret(userEmail: string) {
  const { authenticator } = await import("otplib");
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, "Log Management System", secret);

  // Encrypt before storing
  const encryptedSecret = encryptSensitive(secret);

  let qrDataUrl = "";
  try {
    const QRCode = await import("qrcode");
    qrDataUrl = await QRCode.toDataURL(otpauth);
  } catch {
    qrDataUrl = otpauth; // fallback: return raw URL
  }

  return { secret, encryptedSecret, otpauth, qrDataUrl };
}

export async function verifyMfaToken(token: string, encryptedSecret: string): Promise<boolean> {
  try {
    const { authenticator } = await import("otplib");
    authenticator.options = { window: 1 }; // Allow 30s drift
    const secret = decryptSensitive(encryptedSecret);
    return authenticator.check(token, secret);
  } catch {
    return false;
  }
}

export async function verifyMfaTokenRaw(token: string, rawSecret: string): Promise<boolean> {
  try {
    const { authenticator } = await import("otplib");
    authenticator.options = { window: 1 };
    return authenticator.check(token, rawSecret);
  } catch {
    return false;
  }
}
