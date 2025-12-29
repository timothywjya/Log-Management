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

  if (!nik || nik.length !== 10 || !password) {
    return { error: "NIK (10 digit) dan Password wajib diisi." };
  }

  let responseData: ESSResponse | null = null;
  const maxRetries = 3;
  const url = process.env.ESS_URL || "http://ess1.indomaret.lan:8070/LoginESSREST.svc/v2/LoginESS";

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
        break;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) console.error("ESS Connection failed after 3 attempts");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const essResult = responseData?.LoginESS_V2Result;

  if (essResult === "Sukses") {
    try {
      let user = await db.user.findUnique({
        where: { nik: nik }
      });

      if (!user) {
        user = await db.user.create({
          data: {
            nik: nik,
            is_guest: true,
            login_at: new Date(),
          }
        });
      } else {
        user = await db.user.update({
          where: { nik: nik },
          data: { login_at: new Date() }
        });
      }

      const expires = new Date(Date.now() + 60 * 60 * 1000);
      const sessionToken = await encrypt({ 
        nik: user.nik, 
        role_id: user.role_id, 
        group_id: user.group_id 
      });

      const cookieStore = await cookies();
      cookieStore.set("auth_session", sessionToken, { 
        expires, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        path: "/" 
      });

      if (!user.first_name || !user.user_email) {
        redirect("/register");
      }
      
      redirect("/dashboard");

    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT' || err.digest?.includes('NEXT_REDIRECT')) throw err; 
      
      console.error("Auth Error:", err);
      return { error: "Terjadi kesalahan internal database: " + err.message };
    }
  }

  return { 
    error: essResult || "Gagal terhubung ke server ESS. Silakan coba lagi." 
  };
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("auth_session", "", {
    path: "/",
    expires: new Date(0), 
  });

  cookieStore.delete("auth_session");

  redirect("/login");
}