/**
 * SECURITY — Crypto Utilities
 * - Password hashing: bcrypt (rounds=12)
 * - AES-256-GCM E2EE untuk data sensitif (mfa_secret)
 * - Input sanitization anti-XSS & injection
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

// ─── bcrypt Password Hashing ──────────────────────────────────
const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── AES-256-GCM End-to-End Encryption ───────────────────────
const ENCRYPTION_KEY = (() => {
  const key = process.env.APP_ENCRYPTION_KEY || process.env.APP_SECRET_KEY || "";
  return createHash("sha256").update(key).digest();
})();

export function encryptSensitive(plaintext: string): string {
  const iv        = randomBytes(12);
  const cipher    = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag   = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptSensitive(encryptedData: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(":");
  const iv        = Buffer.from(ivHex, "hex");
  const authTag   = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher  = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// ─── Input Sanitization (XSS Prevention) ─────────────────────
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

export function sanitizeNik(nik: string): string {
  const clean = nik.replace(/\D/g, "");
  if (clean.length !== 10) throw new Error("NIK harus 10 digit angka");
  return clean;
}

export function sanitizeUsername(username: string): string {
  const clean = username.replace(/[^a-zA-Z0-9_.]/g, "");
  if (clean.length < 3 || clean.length > 50) throw new Error("Username 3-50 karakter");
  return clean.toLowerCase();
}

// ─── CSRF Token ───────────────────────────────────────────────
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function verifyCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(storedToken);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
