"use server";

import db from "@/lib/db";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export async function registerUser(formData: FormData) {
  const nik = formData.get("nik") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  try {
    const user = await db.user.update({
      where: { nik: nik },
      data: {
        first_name: firstName,
        last_name: lastName,
        user_email: email,
        is_guest: true, 
      },
    });

    const expires = new Date(Date.now() + 60 * 60 * 1000);
    
    // PERBAIKAN DI SINI: Tambahkan hasName
    const sessionToken = await encrypt({ 
      nik: user.nik, 
      role_id: user.role_id, 
      group_id: user.group_id,
      is_guest: true,
      hasName: true // <--- WAJIB ADA agar lolos dari cek di proxy.ts
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_session", sessionToken, { 
      expires, 
      httpOnly: true, 
      path: "/" 
    });

    redirect("/waiting");
  } catch (err: any) {
    // Pastikan error redirect Next.js tidak tertangkap catch
    if (err.message === 'NEXT_REDIRECT' || err.digest?.includes('NEXT_REDIRECT')) throw err;
    return { error: "Gagal registrasi" };
  }
}