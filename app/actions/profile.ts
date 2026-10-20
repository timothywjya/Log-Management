"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { sanitizeString } from "@/lib/security/crypto";
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
