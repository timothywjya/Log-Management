import db from "@/lib/db";
import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "lmk_";
const KEY_PATTERN = /^lmk_[A-Za-z0-9_-]{43}$/;

/**
 * Membuat secret key baru untuk sebuah program.
 * Format: lmk_ + 32 byte acak (base64url) = 256 bit entropi.
 *
 * Yang disimpan ke database hanya `hash` dan `prefix`. `secret` hanya boleh
 * ditampilkan ke user satu kali, lalu dibuang.
 */
export function generateProgramKey() {
  const secret = KEY_PREFIX + randomBytes(32).toString("base64url");
  return {
    secret,
    hash: hashProgramKey(secret),
    prefix: secret.slice(0, 10), // "lmk_" + 6 karakter, hanya untuk identifikasi di UI
  };
}

// SHA-256 cukup untuk secret acak berentropi tinggi (berbeda dengan password
// manusia yang butuh bcrypt/argon2).
export function hashProgramKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

/**
 * Cari program aktif berdasarkan secret key. Pakai ini di endpoint penerima log
 * (mis. header `x-program-key`) untuk memastikan log datang dari program yang sah.
 */
export async function findProgramByKey(secret: string | null | undefined) {
  if (!secret || !KEY_PATTERN.test(secret)) return null;
  return db.program.findFirst({
    where: { secret_key_hash: hashProgramKey(secret), deleted_at: null },
    select: { id: true, program_name: true, program_group_id: true, program_type_id: true },
  });
}
