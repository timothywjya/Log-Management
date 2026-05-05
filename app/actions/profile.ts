"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword, sanitizeString } from "@/lib/security/crypto";
import { revalidatePath } from "next/cache";

// ─── Update Info Profil (nama + email) ──────────────────────────
export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sesi tidak valid, silakan login kembali" };

  const firstName = sanitizeString((formData.get("first_name") as string)?.trim() ?? "");
  const lastName  = sanitizeString((formData.get("last_name")  as string)?.trim() ?? "");
  const email     = sanitizeString((formData.get("user_email") as string)?.trim() ?? "");

  if (!firstName || !lastName || !email) {
    return { error: "Nama dan email wajib diisi" };
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return { error: "Format email tidak valid" };

  const user = await db.user.findUnique({ where: { nik: session.nik } });
  if (!user) return { error: "User tidak ditemukan" };

  // Cek email sudah dipakai user lain
  if (email !== user.user_email) {
    const existing = await db.user.findFirst({
      where: { user_email: email, NOT: { nik: session.nik } },
    });
    if (existing) return { error: "Email sudah digunakan akun lain" };
  }

  await db.user.update({
    where: { nik: session.nik },
    data: {
      first_name: firstName,
      last_name:  lastName,
      user_email: email,
      updated_at: new Date(),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Update Password ─────────────────────────────────────────────
export async function updatePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sesi tidak valid, silakan login kembali" };

  const currentPassword = (formData.get("current_password") as string) ?? "";
  const newPassword     = (formData.get("new_password")     as string) ?? "";
  const confirmPassword = (formData.get("confirm_password") as string) ?? "";

  if (!newPassword || !confirmPassword) {
    return { error: "Password baru dan konfirmasi wajib diisi" };
  }
  if (newPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok" };
  }

  const user = await db.user.findUnique({ where: { nik: session.nik } });
  if (!user) return { error: "User tidak ditemukan" };

  // Jika user sudah punya password, wajib verifikasi password lama
  if (user.password_hash) {
    if (!currentPassword) return { error: "Password saat ini wajib diisi" };
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) return { error: "Password saat ini tidak sesuai" };
  }

  // Cek password baru tidak sama dengan yang lama
  if (user.password_hash) {
    const sameAsOld = await verifyPassword(newPassword, user.password_hash);
    if (sameAsOld) return { error: "Password baru tidak boleh sama dengan password lama" };
  }

  const hashed = await hashPassword(newPassword);
  await db.user.update({
    where: { nik: session.nik },
    data: { password_hash: hashed, updated_at: new Date() },
  });

  return { success: true };
}

// ─── Force Reset Password (first login) ─────────────────────────
export async function forceResetPassword(userId: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sesi tidak valid, silakan login kembali" };

  const newPassword     = (formData.get("new_password")     as string) ?? "";
  const confirmPassword = (formData.get("confirm_password") as string) ?? "";

  if (!newPassword || !confirmPassword) {
    return { error: "Semua field wajib diisi" };
  }
  if (newPassword.length < 8) {
    return { error: "Password minimal 8 karakter" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok" };
  }

  const { hashPassword } = await import("@/lib/security/crypto");
  const hashed = await hashPassword(newPassword);

  await db.user.update({
    where: { id: userId },
    data: {
      password_hash:       hashed,
      must_reset_password: false,
      updated_at:          new Date(),
    },
  });

  return { success: true };
}
