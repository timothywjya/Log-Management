// Aturan akses terpusat (kode murni). Dipakai di server (use case, guard) DAN di client
// (untuk menyembunyikan tombol). Server tetap wajib memeriksa sendiri, jangan hanya
// mengandalkan UI.

export type AccessUser = { role_id: number | null; group_id: number | null };

/** ID baris di tabel `roles` / `program_groups` yang punya arti khusus. */
export const ADMIN_ROLE_ID = 1;
export const ADMIN_GROUP_ID = 6;

/** Role yang boleh melihat & mengelola program semua group. */
const ALL_PROGRAMS_ROLE_IDS = [4, 5];
/** Role yang hanya boleh membuat program di group miliknya sendiri. */
const OWN_GROUP_ROLE_IDS = [2, 3];
/** Role manajer tim, per group_level anggota: 1 = programmer, 2 = support. */
const MEMBER_MANAGER_ROLE_IDS: Record<number, number[]> = {
  1: [3, 4, 5],
  2: [7, 8, 9],
};

export const isAdmin = (u: AccessUser) =>
  u.role_id === ADMIN_ROLE_ID || u.group_id === ADMIN_GROUP_ID;

export const canSeeAllPrograms = (u: AccessUser) =>
  isAdmin(u) || ALL_PROGRAMS_ROLE_IDS.includes(u.role_id ?? -1);

/** Role 2 & 3 hanya boleh membuat program di group miliknya sendiri. */
export const isLockedToOwnGroup = (u: AccessUser) => OWN_GROUP_ROLE_IDS.includes(u.role_id ?? -1);

export const canManageProgram = (u: AccessUser, programGroupId: number) =>
  isAdmin(u) ||
  ALL_PROGRAMS_ROLE_IDS.includes(u.role_id ?? -1) ||
  (u.role_id === 3 && u.group_id === programGroupId);

/** groupLevel member: 1 = programmer, 2 = support */
export function canManageTeamMember(actor: AccessUser, memberGroupLevel: number | null) {
  if (actor.role_id === ADMIN_ROLE_ID) return true;
  if (memberGroupLevel === null) return false;
  return (MEMBER_MANAGER_ROLE_IDS[memberGroupLevel] ?? []).includes(actor.role_id ?? -1);
}
