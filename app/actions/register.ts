"use server";

import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const nik = formData.get("nik") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  // 1. Validasi sederhana
  if (!firstName || !lastName || !email) {
    return { error: "Semua field wajib diisi." };
  }

  try {
    // 2. Logika Database (Contoh Prisma/Drizzle)
    // await db.user.update({
    //   where: { nik: nik },
    //   data: {
    //     first_name: firstName,
    //     last_name: lastName,
    //     user_email: email,
    //     is_guest: false // Mengubah status dari guest
    //   }
    // });

    console.log("User Updated:", { nik, firstName, lastName, email });
    
    // 3. Redirect ke Dashboard setelah sukses
    redirect("/dashboard");
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') throw err;
    return { error: "Gagal menyimpan data: " + err.message };
  }
}