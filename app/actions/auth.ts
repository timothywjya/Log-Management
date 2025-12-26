"use server";

import db from "@/lib/db";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface ESSResponse {
  LoginESS_V2Result: string;
}

export async function authenticate(formData: FormData) {
  const nik = formData.get("nik") as string;
  const password = formData.get("password") as string;

  console.log("--- [START AUTHENTICATE] ---");
  console.log("NIK:", nik);

  if (!nik || nik.length !== 10 || !password) {
    return { error: "NIK (10 digit) dan Password wajib diisi." };
  }

  let responseData: ESSResponse | null = null;
  const maxRetries = 3;
  const url = 'http://ess1.indomaret.lan:8070/LoginESSREST.svc/v2/LoginESS';

  console.log("1. Mencoba koneksi ke API ESS...");
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { nik: nik, pass: password }
        }),
        cache: 'no-store'
      });

      if (response.ok) {
        responseData = await response.json();
        console.log("   - Respon API ESS diterima.");
        break;
      }
    } catch (error) {
      console.error(`   - Gagal percobaan ke-${attempt + 1}`);
      if (attempt === maxRetries - 1) console.error("ESS Connection failed after 3 attempts");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const essResult = responseData?.LoginESS_V2Result;
  console.log("2. Hasil ESS Result:", essResult);

  if (essResult === "Sukses") {
    try {
      console.log("3. Login ESS Berhasil. Memproses Session & DB...");
      
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      const sessionToken = await encrypt({ nik });

      const cookieStore = await cookies();
      cookieStore.set("auth_session", sessionToken, { 
        expires, 
        httpOnly: true, 
        secure: process.env.APP_ENV === "production",
        path: "/" 
      });
      console.log("   - Cookie Session diset.");

      console.log("4. Mencoba Query findUnique ke DB...");
      let user = await db.user.findUnique({
        where: { nik: nik }
      });

      if (!user) {
        console.log("   - User baru (Guest). Mencoba Create User...");
        user = await db.user.create({
          data: {
            nik: nik,
            is_guest: true,
            login_at: new Date(),
          }
        });
        console.log("   - User Created.");
      } else {
        console.log("   - User ditemukan di database.");
      }

      if (!user.first_name || !user.user_email) {
        console.log("5. Redirecting to /register...");
        redirect("/register");
      }

      console.log("5. Redirecting to /dashboard...");
      redirect("/dashboard");

    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT' || err.digest?.includes('NEXT_REDIRECT')) throw err; 
      
      console.error("--- [DATABASE ERROR] ---");
      console.error("Pesan:", err.message);
      return { error: "Terjadi kesalahan internal database." };
    }
  }

  console.log("--- [AUTH FAILED] ---");
  return { 
    error: essResult || "Gagal terhubung ke server ESS. Silakan coba lagi." 
  };
}