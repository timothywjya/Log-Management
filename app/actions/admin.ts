"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminUser, isManagerUser } from "@/lib/config/admin";
import { revalidatePath } from "next/cache";

/** Guard: cek Administrator */
async function guardAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true },
  });

  if (!isAdminUser(user)) throw new Error("Forbidden: Administrator only");
  return user!;
}

/** Guard: cek Administrator atau Manager */
async function guardAdminOrManager() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true, team: true },
  });

  if (!isAdminUser(user) && !isManagerUser(user)) throw new Error("Forbidden");
  return user!;
}

// ─── Delete User (permanent) ──────────────────────────────────
export async function deleteUserAction(targetUserId: string, currentUserId: string) {
  await guardAdmin();
  if (targetUserId === currentUserId) throw new Error("Tidak bisa menghapus akun sendiri");
  await db.user.delete({ where: { id: targetUserId } });
  revalidatePath("/admin");
  revalidatePath("/users/team-programmer");
  revalidatePath("/users/team-support");
}

// ─── Soft Delete / Restore ────────────────────────────────────
export async function softDeleteUserAction(userId: string, action: "delete" | "restore", currentUserId: string) {
  await guardAdmin();
  const data =
    action === "delete"
      ? { deleted_at: new Date(), deleted_by: currentUserId }
      : { deleted_at: null, deleted_by: null };
  await db.user.update({ where: { id: userId }, data });
  revalidatePath("/admin");
}

// ─── Approve User (simple - tanpa assignment) ─────────────────
export async function approveUserAction(targetUserId: string, currentUserId: string) {
  await guardAdmin();
  await db.user.update({
    where: { id: targetUserId },
    data: { is_guest: false, updated_by: currentUserId, updated_at: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath("/users/request-member");
}

// ─── Assign Tim Programmer & Tim Support untuk ProgramGroup ───
//  Menggantikan assignGroupTeamAction (program_group_teams sudah dihapus)
export async function assignGroupTeamsAction(
  programGroupId: string,
  programmerTeamId: string | null,
  supportTeamId: string | null
) {
  await guardAdmin();
  await db.programGroup.update({
    where: { id: programGroupId },
    data: {
      programmer_team_id: programmerTeamId || null,
      support_team_id:    supportTeamId    || null,
      updated_at:         new Date(),
    },
  });
  revalidatePath("/admin");
}

// ─── Update User Settings ─────────────────────────────────────
// Administrator: bisa update semua field
// Manager: hanya bisa update team_id + group_id
export async function updateUserSettingsAction(
  targetUserId: string,
  data: {
    team_id?: string | null;
    sub_team_id?: string | null;
    group_id?: string | null;
    is_admin?: boolean;
    is_manager?: boolean;
    must_reset_password?: boolean;
  }
) {
  const guard = await guardAdminOrManager();
  const isAdmin = isAdminUser(guard);

  const updateData: any = {};
  if (data.team_id  !== undefined) updateData.team_id  = data.team_id  || null;
  if (data.group_id !== undefined) updateData.group_id = data.group_id || null;

  if (isAdmin) {
    if (data.sub_team_id          !== undefined) updateData.sub_team_id          = data.sub_team_id || null;
    if (data.is_admin             !== undefined) updateData.is_admin             = data.is_admin;
    if (data.is_manager           !== undefined) updateData.is_manager           = data.is_manager;
    if (data.must_reset_password  !== undefined) updateData.must_reset_password  = data.must_reset_password;
  }

  updateData.updated_at = new Date();
  updateData.updated_by = guard.id;

  await db.user.update({ where: { id: targetUserId }, data: updateData });
  revalidatePath("/admin");
  revalidatePath("/users/request-member");
}

// ─── Toggle must_reset_password ───────────────────────────────
export async function setMustResetPassword(targetUserId: string, value: boolean) {
  await guardAdmin();
  await db.user.update({
    where: { id: targetUserId },
    data: { must_reset_password: value, updated_at: new Date() },
  });
  revalidatePath("/admin");
}

// ─── Create new user (oleh Admin) ────────────────────────────
export async function createUserAction(data: {
  nik: string;
  username?: string;
  first_name: string;
  last_name: string;
  user_email: string;
  team_id?: string;
  sub_team_id?: string;
  group_id?: string;
  is_manager?: boolean;
}) {
  const adminUser = await guardAdmin();

  const { hashPassword } = await import("@/lib/security/crypto");
  const defaultHash = await hashPassword(data.nik);

  const user = await db.user.create({
    data: {
      nik:                 data.nik,
      username:            data.username   || undefined,
      first_name:          data.first_name,
      last_name:           data.last_name,
      user_email:          data.user_email,
      team_id:             data.team_id    || undefined,
      sub_team_id:         data.sub_team_id || undefined,
      group_id:            data.group_id   || undefined,
      is_guest:            false,
      is_manager:          data.is_manager ?? false,
      must_reset_password: true,
      password_hash:       defaultHash,
      created_by:          adminUser.id,
    },
  });

  revalidatePath("/admin");
  return { success: true, userId: user.id };
}
