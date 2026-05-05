import { userRepository } from "@/lib/repositories/user.repository";
import { hashPassword, verifyPassword, sanitizeNik } from "@/lib/security/crypto";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/config/admin";
import db from "@/lib/db";

export interface LoginResult {
  success: boolean;
  requiresMfa?: boolean;
  requiresPasswordReset?: boolean;
  userId?: string;
  error?: string;
}

export interface AuthPayload {
  nik: string;
  username?: string;
  group_id: string | null;
  team_id: string | null;
  is_guest: boolean;
  is_admin: boolean;
  is_manager: boolean;
  must_reset_password: boolean;
  hasName: boolean;
}

/** Fetch user dengan JOIN program_group + team untuk deteksi admin & manager */
async function fetchUserFull(nik: string) {
  return db.user.findUnique({
    where: { nik },
    include: { program_group: true, team: true },
  });
}

// ─── Login via ESS ──────────────────────────────────
export async function loginViaEss(nik: string, password: string): Promise<LoginResult> {
  try {
    const cleanNik = sanitizeNik(nik);

    const url = process.env.ESS_URL!;
    const maxRetries = 3;
    let responseData: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: { nik: cleanNik, pass: password } }),
          cache: "no-store",
        });
        if (res.ok) { responseData = await res.json(); break; }
      } catch {
        if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (responseData?.LoginESS_V2Result !== "Sukses") {
      return { success: false, error: responseData?.LoginESS_V2Result || "Gagal terhubung ke ESS" };
    }

    await userRepository.upsertByNik(cleanNik, { login_at: new Date() } as any);

    const user = await fetchUserFull(cleanNik);
    if (!user) return { success: false, error: "User tidak ditemukan" };

    // Cek wajib reset password
    if (user.must_reset_password) {
      await issueSessionCookie(user);
      return { success: true, requiresPasswordReset: true };
    }

    await issueSessionCookie(user);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Internal error: " + err.message };
  }
}

// ─── Login via Username/Password ────────────────────
export async function loginViaCredentials(
  usernameOrNik: string,
  password: string,
  mfaToken?: string
): Promise<LoginResult> {
  try {
    let baseUser = await userRepository.findByUsername(usernameOrNik);
    if (!baseUser) {
      try { baseUser = await userRepository.findByNik(sanitizeNik(usernameOrNik)); } catch { /* bukan format NIK */ }
    }

    if (!baseUser || !baseUser.password_hash) {
      return { success: false, error: "Username atau password salah" };
    }

    const passwordValid = await verifyPassword(password, baseUser.password_hash);
    if (!passwordValid) {
      return { success: false, error: "Username atau password salah" };
    }

    const user = await fetchUserFull(baseUser.nik);
    if (!user) return { success: false, error: "User tidak ditemukan" };

    // Cek wajib reset password
    if (user.must_reset_password) {
      await userRepository.updateLoginTimestamp(user.nik);
      await issueSessionCookie(user);
      return { success: true, requiresPasswordReset: true };
    }

    await userRepository.updateLoginTimestamp(user.nik);
    await issueSessionCookie(user);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Internal error: " + err.message };
  }
}

// ─── Verify MFA — dipertahankan tapi tidak dipanggil aktif ─
export async function verifyMfaStep(userId: string, token: string): Promise<LoginResult> {
  try {
    const baseUser = await userRepository.findById(userId);
    if (!baseUser) return { success: false, error: "User tidak ditemukan" };

    const user = await fetchUserFull(baseUser.nik);
    if (!user) return { success: false, error: "User tidak ditemukan" };

    await userRepository.updateLoginTimestamp(user.nik);
    await issueSessionCookie(user);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Issue HTTP-Only JWT Cookie ──────────────────────
async function issueSessionCookie(user: any) {
  const payload: AuthPayload = {
    nik: user.nik,
    username: user.username ?? undefined,
    group_id: user.group_id,
    team_id: user.team_id,
    is_guest: user.is_guest,
    is_admin: isAdminUser(user),
    is_manager: user.is_manager ?? false,
    must_reset_password: user.must_reset_password ?? false,
    hasName: !!(user.first_name && user.last_name),
  };

  const token = await encrypt(payload);
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("auth_session", token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

// ─── Set Password ───────────────────────────────────
export async function setUserPassword(userId: string, newPassword: string): Promise<boolean> {
  if (newPassword.length < 8) throw new Error("Password minimal 8 karakter");
  const hash = await hashPassword(newPassword);
  await userRepository.update(userId, { password_hash: hash } as any);
  return true;
}
