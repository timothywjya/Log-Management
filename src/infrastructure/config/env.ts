// Satu-satunya tempat membaca process.env. Dibaca lazy (saat dipakai), bukan saat import,
// supaya `next build` tidak gagal hanya karena variabel runtime belum di-set.

export const env = {
  // Tidak melempar error: klien database dibuat saat modul di-import (termasuk saat `next build`),
  // sedangkan koneksi baru benar-benar dibuka ketika query pertama dijalankan.
  get databaseUrl() {
    return process.env.DATABASE_URL;
  },

  /**
   * Secret untuk menandatangani JWT sesi. Sengaja melempar error jika belum di-set,
   * karena key kosong tidak aman. Buat dengan: npm run generate:secret
   */
  get appSecretKey() {
    const secret = process.env.APP_SECRET_KEY;
    if (!secret || secret.length < 32) {
      throw new Error(
        "APP_SECRET_KEY belum di-set atau kurang dari 32 karakter. Jalankan: npm run generate:secret"
      );
    }
    return secret;
  },

  get essUrl() {
    return process.env.ESS_URL || "http://ess1.indomaret.lan:8070/LoginESSREST.svc/v2/LoginESS";
  },

  /**
   * true  = password diperiksa ke ESS saat login (WAJIB di production).
   * false = password TIDAK diperiksa; siapa pun dengan NIK 10 digit bisa login (hanya development).
   */
  get essVerifyPassword() {
    return process.env.ESS_VERIFY_PASSWORD === "true";
  },

  /**
   * Cookie `secure` hanya bekerja di HTTPS. Jika aplikasi dijalankan lewat HTTP
   * di jaringan internal, set COOKIE_SECURE=false di .env.
   */
  get cookieSecure() {
    if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
    return process.env.NODE_ENV === "production";
  },
};
