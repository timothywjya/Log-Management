import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.APP_JWT_KEY ?? process.env.APP_SECRET_KEY ?? "";
if (!secretKey || secretKey.length < 32) {
  console.warn("[SESSION] APP_JWT_KEY harus minimal 32 karakter!");
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, any>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, any> | null> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload as Record<string, any>;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Record<string, any> | null> {
  const session = (await cookies()).get("auth_session")?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("auth_session", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function extendSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("auth_session")?.value;
  if (!raw) return false;
  const payload = await decrypt(raw);
  if (!payload) return false;

  const token = await encrypt({ ...payload });
  cookieStore.set("auth_session", token, {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return true;
}
