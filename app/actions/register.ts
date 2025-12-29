"use server";

import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const nik = formData.get("nik") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  if (!firstName || !lastName || !email) {
    return { error: "Semua field wajib diisi." };
  }

  try {
    redirect("/dashboard");
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') throw err;
    return { error: "Gagal menyimpan data: " + err.message };
  }
}