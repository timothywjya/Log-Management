import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "auth_session";
export const SESSION_TTL_MS = 60 * 60 * 1000; // 1 jam

export type SessionPayload = {
  nik: string;
  role_id: number | null;
  group_id: number | null;
  is_guest: boolean;
  /** true jika profil (nama depan, nama belakang, email) sudah lengkap */
  hasName: boolean;
};

/**
 * Secret untuk menandatangani JWT. Sengaja melempar error jika belum di-set,
 * karena TextEncoder().encode(undefined) menghasilkan key kosong yang tidak aman.
 * Buat dengan: npm run generate:secret
 */
function getKey() {
  const secret = process.env.APP_SECRET_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      "APP_SECRET_KEY belum di-set atau kurang dari 32 karakter. Jalankan: npm run generate:secret"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  const key = getKey(); // di luar try: salah konfigurasi harus terlihat, bukan diam-diam logout
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return await decrypt(session);
}

/**
 * Cookie `secure` hanya bekerja di HTTPS. Jika aplikasi dijalankan lewat HTTP
 * di jaringan internal, set COOKIE_SECURE=false di .env.
 */
function shouldUseSecureCookie() {
  if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
  return process.env.NODE_ENV === "production";
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    expires: new Date(Date.now() + SESSION_TTL_MS),
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}
