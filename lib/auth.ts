import db from "@/lib/db";
import { isAdmin } from "@/lib/permissions";
import { getSession, type SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export function toSessionPayload(user: {
  nik: string;
  role_id: number | null;
  group_id: number | null;
  is_guest: boolean;
  first_name: string | null;
  last_name: string | null;
  user_email: string | null;
}): SessionPayload {
  return {
    nik: user.nik,
    role_id: user.role_id,
    group_id: user.group_id,
    is_guest: user.is_guest,
    hasName: !!(user.first_name && user.last_name && user.user_email),
  };
}

/**
 * Untuk Server Component / page. Selalu cek ke database, jadi user yang sudah
 * dinonaktifkan atau dihapus langsung kehilangan akses (tidak menunggu JWT habis).
 *
 * Jika user tidak ada lagi, diarahkan ke /api/session/clear (bukan /login langsung)
 * karena cookie harus dihapus dulu; kalau tidak, proxy.ts akan melempar balik ke
 * /dashboard dan terjadi redirect loop.
 */
export async function requireUser(opts: { admin?: boolean } = {}) {
  const session = await getSession();
  if (!session?.nik) redirect("/login");

  const user = await db.user.findFirst({
    where: { nik: session.nik, deleted_at: null },
    include: { role: true, program_group: true },
  });

  if (!user) redirect("/api/session/clear");
  if (user.is_guest) redirect("/waiting");
  if (opts.admin && !isAdmin(user)) redirect("/dashboard");

  return user;
}

/** Untuk Server Action. Mengembalikan null (bukan redirect) agar bisa dibalas sebagai error. */
export async function getActionUser() {
  const session = await getSession();
  if (!session?.nik) return null;
  return db.user.findFirst({
    where: { nik: session.nik, deleted_at: null, is_guest: false },
  });
}

export const UNAUTHORIZED = { ok: false, error: "Sesi tidak valid. Silakan login ulang." } as const;
export const FORBIDDEN = { ok: false, error: "Anda tidak memiliki akses untuk aksi ini." } as const;
