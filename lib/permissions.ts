// Aturan akses terpusat. Dipakai di server (pages & actions) DAN client (untuk
// menyembunyikan tombol). Server tetap harus memanggil fungsi ini sendiri,
// jangan pernah hanya mengandalkan UI.

export type AccessUser = { role_id: number | null; group_id: number | null };

export const isAdmin = (u: AccessUser) => u.role_id === 1 || u.group_id === 6;

export const canSeeAllPrograms = (u: AccessUser) =>
  isAdmin(u) || u.role_id === 4 || u.role_id === 5;

/** Role 2 & 3 hanya boleh membuat program di group miliknya sendiri. */
export const isLockedToOwnGroup = (u: AccessUser) =>
  u.role_id === 2 || u.role_id === 3;

export const canManageProgram = (u: AccessUser, programGroupId: number) =>
  isAdmin(u) ||
  u.role_id === 4 ||
  u.role_id === 5 ||
  (u.role_id === 3 && u.group_id === programGroupId);

/** groupLevel member: 1 = programmer, 2 = support */
export function canManageTeamMember(actor: AccessUser, memberGroupLevel: number | null) {
  if (actor.role_id === 1) return true;
  if (memberGroupLevel === 1) return [3, 4, 5].includes(actor.role_id ?? -1);
  if (memberGroupLevel === 2) return [7, 8, 9].includes(actor.role_id ?? -1);
  return false;
}
