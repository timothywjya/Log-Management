"use server";

import db from "@/lib/db";
import { toSessionPayload } from "@/lib/auth";
import { getSession, setSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Nama depan wajib diisi").max(100),
  lastName: z.string().trim().min(1, "Nama belakang wajib diisi").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid").max(150),
});

export async function registerUser(formData: FormData) {
  // NIK diambil dari sesi, BUKAN dari form. Sebelumnya NIK dibaca dari hidden
  // input sehingga user yang login bisa menimpa profil orang lain.
  const session = await getSession();
  if (!session?.nik) redirect("/login");

  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.user.findFirst({ where: { nik: session.nik, deleted_at: null } });
  if (!existing) redirect("/api/session/clear");

  let isGuest = true;
  try {
    // is_guest sengaja tidak diubah di sini; hanya admin yang boleh lewat approveUser.
    const user = await db.user.update({
      where: { nik: session.nik },
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        user_email: parsed.data.email,
      },
    });
    isGuest = user.is_guest;
    await setSessionCookie(toSessionPayload(user));
  } catch (err: any) {
    if (err?.code === "P2002") return { error: "Email sudah digunakan akun lain." };
    console.error("Register error:", err);
    return { error: "Gagal menyimpan profil. Silakan coba lagi." };
  }

  redirect(isGuest ? "/waiting" : "/dashboard");
}
