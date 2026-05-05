"use server";

import { loginViaEss, loginViaCredentials, verifyMfaStep } from "@/lib/controllers/auth.controller";
import { clearSession, extendSession, getSession } from "@/lib/session";
import { userRepository } from "@/lib/repositories/user.repository";
import { sanitizeNik } from "@/lib/security/crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

// ─── Issue CSRF cookie (called after any successful login) ───
async function issueCsrf() {
  const csrfToken = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("csrf_token", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

async function resolveRedirect(nik: string, mustResetPassword?: boolean) {
  if (mustResetPassword) redirect("/reset-password");
  const user = await userRepository.findByNik(nik);
  if (!user?.first_name || !user?.user_email) redirect("/register");
  if (user?.is_guest) redirect("/waiting");
  redirect("/dashboard");
}

// ─── PRIMARY: Login via ESS (NIK + ESS password) ────────────
export async function authenticate(formData: FormData) {
  const nik      = formData.get("nik") as string;
  const password = formData.get("password") as string;

  try { sanitizeNik(nik); } catch {
    return { error: "NIK harus 10 digit angka" };
  }
  if (!password) return { error: "Password wajib diisi" };

  const result = await loginViaEss(nik, password);

  if (!result.success) return { error: result.error };
  if (result.requiresMfa) return { requiresMfa: true, userId: result.userId };

  await issueCsrf();

  const session = await getSession();
  if (!session) return { error: "Sesi tidak ditemukan setelah login" };

  await resolveRedirect(nik, result.requiresPasswordReset);
}

// ─── ALTERNATIVE: Login via Username / NIK + Password ────────
export async function authenticateCredentials(formData: FormData) {
  const usernameOrNik = (formData.get("username") as string)?.trim();
  const password      = formData.get("password") as string;
  const mfaToken      = (formData.get("mfa_token") as string) || undefined;

  if (!usernameOrNik || !password) {
    return { error: "Username dan password wajib diisi" };
  }

  const result = await loginViaCredentials(usernameOrNik, password, mfaToken);

  if (!result.success) return { error: result.error };
  if (result.requiresMfa) return { requiresMfa: true, userId: result.userId };

  await issueCsrf();

  // Find user nik for redirect logic
  let nik = usernameOrNik;
  try {
    const found = await userRepository.findByUsername(usernameOrNik);
    if (found) nik = found.nik;
  } catch { /* nik was passed directly */ }

  await resolveRedirect(nik, result.requiresPasswordReset);
}

// ─── MFA Verification (step 2) ───────────────────────────────
export async function verifyMfa(formData: FormData) {
  const userId = (formData.get("user_id") as string)?.trim();
  const token  = (formData.get("mfa_token") as string)?.replace(/\s/g, "");

  if (!userId || !token || token.length !== 6) {
    return { error: "Kode OTP harus 6 digit" };
  }

  const result = await verifyMfaStep(userId, token);
  if (!result.success) return { error: result.error };

  await issueCsrf();

  const session = await getSession();
  if (!session) return { error: "Sesi tidak ditemukan setelah MFA" };

  const user = await userRepository.findById(userId);
  if (user) await resolveRedirect(user.nik);
  redirect("/dashboard");
}

// ─── Logout ──────────────────────────────────────────────────
export async function logout() {
  await clearSession();
  const cookieStore = await cookies();
  cookieStore.delete("csrf_token");
  redirect("/login");
}

export async function updateSessionStatus() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await userRepository.findByNik(session!.nik);
  if (user && !user.is_guest) redirect("/dashboard");
  redirect("/waiting");
}

export { extendSession };
