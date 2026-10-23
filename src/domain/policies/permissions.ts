// Aturan akses terpusat (kode murni). Dipakai di server (use case, guard) DAN di client
// (untuk menyembunyikan tombol). Server tetap wajib memeriksa sendiri, jangan hanya
// mengandalkan UI.

export type AccessUser = { role_id: number | null; group_id: number | null };

/** ID baris di tabel `roles` / `program_groups` yang punya arti khusus. */
export const ADMIN_ROLE_ID = 1;
export const ADMIN_GROUP_ID = 6;

/** Role setingkat Department/Division Leader (programmer 4,5 dan support 8,9): lintas group. */
const CROSS_GROUP_ROLE_IDS = [4, 5, 8, 9];
/** Role yang mengedit/menghapus program, tetapi hanya di group miliknya sendiri. */
const OWN_GROUP_MANAGER_ROLE_IDS = [3];
/** Role manajer tim, per group_level anggota: 1 = programmer, 2 = support. */
const MEMBER_MANAGER_ROLE_IDS: Record<number, number[]> = {
  1: [3, 4, 5],
  2: [7, 8, 9],
};

export const isAdmin = (u: AccessUser) =>
  u.role_id === ADMIN_ROLE_ID || u.group_id === ADMIN_GROUP_ID;

/** Admin dan role lintas group melihat program & activity log semua group. */
export const canSeeAllPrograms = (u: AccessUser) =>
  isAdmin(u) || CROSS_GROUP_ROLE_IDS.includes(u.role_id ?? -1);

/** Selain itu, program baru selalu dibuat di group milik user sendiri. */
export const isLockedToOwnGroup = (u: AccessUser) => !canSeeAllPrograms(u);

export const canManageProgram = (u: AccessUser, programGroupId: number) =>
  canSeeAllPrograms(u) ||
  (OWN_GROUP_MANAGER_ROLE_IDS.includes(u.role_id ?? -1) && u.group_id === programGroupId);

/** groupLevel member: 1 = programmer, 2 = support */
export function canManageTeamMember(actor: AccessUser, memberGroupLevel: number | null) {
  if (actor.role_id === ADMIN_ROLE_ID) return true;
  if (memberGroupLevel === null) return false;
  return (MEMBER_MANAGER_ROLE_IDS[memberGroupLevel] ?? []).includes(actor.role_id ?? -1);
}