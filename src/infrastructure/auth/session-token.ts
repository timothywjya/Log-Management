// Penandatanganan & verifikasi JWT sesi. Tidak bergantung pada Next.js, jadi bisa
// dipakai oleh proxy.ts maupun CookieSessionService.

import type { SessionPayload } from "@/domain/entities/session";
import { env } from "@/infrastructure/config/env";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "auth_session";
export const SESSION_TTL_MS = 60 * 60 * 1000; // 1 jam

const key = () => new TextEncoder().encode(env.appSecretKey);

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const secret = key(); // di luar try: salah konfigurasi harus terlihat, bukan diam-diam logout
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
