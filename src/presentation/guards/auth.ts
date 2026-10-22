import type { UserWithAccess } from "@/domain/entities/user";
import { isAdmin } from "@/domain/policies/permissions";
import { container } from "@/infrastructure/container";
import { redirect } from "next/navigation";

/**
 * Untuk Server Component / page. Mengarahkan user ke halaman yang sesuai jika sesi
 * tidak valid, masih guest, atau bukan admin (saat `admin: true`).
 *
 * User yang sudah tidak ada diarahkan ke /api/session/clear (bukan /login langsung)
 * karena cookie harus dihapus dulu; kalau tidak, proxy.ts akan melempar balik ke
 * /dashboard dan terjadi redirect loop.
 */
export async function requireUser(opts: { admin?: boolean } = {}): Promise<UserWithAccess> {
  const outcome = await container.getSessionUser.execute();
  if (outcome.status === "no-session") redirect("/login");
  if (outcome.status === "inactive") redirect("/api/session/clear");

  const { user } = outcome;
  if (user.is_guest) redirect("/waiting");
  if (opts.admin && !isAdmin(user)) redirect("/dashboard");
  return user;
}

/** Untuk Server Action. Mengembalikan null (bukan redirect) agar bisa dibalas sebagai error. */
export async function getActionUser(): Promise<UserWithAccess | null> {
  const outcome = await container.getSessionUser.execute();
  return outcome.status === "ok" && !outcome.user.is_guest ? outcome.user : null;
}
