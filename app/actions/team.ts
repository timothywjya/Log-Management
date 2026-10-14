"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminUser, isManagerUser } from "@/lib/config/admin";
import { revalidatePath } from "next/cache";

// ─── Guard: Admin atau Manager ────────────────────────────────
async function guardAdminOrManager() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true, team: true },
  });

  if (!isAdminUser(user) && !isManagerUser(user)) {
    throw new Error("Forbidden: Hanya Administrator atau Manager");
  }
  return user!;
}

// ─── Guard: Admin saja ────────────────────────────────────────
async function guardAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true, team: true },
  });

  if (!isAdminUser(user)) {
    throw new Error("Forbidden: Hanya Administrator");
  }
  return user!;
}

// ═══════════════════════════════════════════════════════════════
//  TEAMS
// ═══════════════════════════════════════════════════════════════

/** Buat Team baru */
export async function createTeamAction(data: {
  team_name: string;
  team_type: "programmer" | "support";
}) {
  const actor = await guardAdminOrManager();

  if (!data.team_name.trim()) throw new Error("Nama tim tidak boleh kosong");

  const team = await db.team.create({
    data: {
      team_name: data.team_name.trim(),
      team_type: data.team_type,
      created_by: actor.id,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true, team };
}

/** Update Team */
export async function updateTeamAction(
  teamId: string,
  data: { team_name: string; team_type: "programmer" | "support" }
) {
  const actor = await guardAdminOrManager();

  if (!data.team_name.trim()) throw new Error("Nama tim tidak boleh kosong");

  const existing = await db.team.findUnique({ where: { id: teamId } });
  if (!existing) throw new Error("Tim tidak ditemukan");
  if (existing.deleted_at) throw new Error("Tim sudah dihapus, restore terlebih dahulu");

  await db.team.update({
    where: { id: teamId },
    data: {
      team_name: data.team_name.trim(),
      team_type: data.team_type,
      updated_by: actor.id,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}

/** Soft Delete Team */
export async function softDeleteTeamAction(teamId: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.team.findUnique({ where: { id: teamId } });
  if (!existing) throw new Error("Tim tidak ditemukan");
  if (existing.deleted_at) throw new Error("Tim sudah dihapus");

  await db.team.update({
    where: { id: teamId },
    data: { deleted_at: new Date(), deleted_by: actor.id },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}

/** Restore Team (dari soft delete) */
export async function restoreTeamAction(teamId: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.team.findUnique({ where: { id: teamId } });
  if (!existing) throw new Error("Tim tidak ditemukan");
  if (!existing.deleted_at) throw new Error("Tim belum dihapus");

  await db.team.update({
    where: { id: teamId },
    data: { deleted_at: null, deleted_by: null, updated_by: actor.id },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
//  SUB TEAMS
// ═══════════════════════════════════════════════════════════════

/** Buat Sub Team baru */
export async function createSubTeamAction(data: {
  sub_team_name: string;
  team_id: string;
}) {
  const actor = await guardAdminOrManager();

  if (!data.sub_team_name.trim()) throw new Error("Nama sub tim tidak boleh kosong");
  if (!data.team_id) throw new Error("Tim induk wajib dipilih");

  const parentTeam = await db.team.findUnique({ where: { id: data.team_id } });
  if (!parentTeam) throw new Error("Tim induk tidak ditemukan");
  if (parentTeam.deleted_at) throw new Error("Tim induk sudah dihapus");

  const subTeam = await db.subTeam.create({
    data: {
      sub_team_name: data.sub_team_name.trim(),
      team_id: data.team_id,
      created_by: actor.id,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true, subTeam };
}

/** Update Sub Team */
export async function updateSubTeamAction(
  subTeamId: string,
  data: { sub_team_name: string; team_id: string }
) {
  const actor = await guardAdminOrManager();

  if (!data.sub_team_name.trim()) throw new Error("Nama sub tim tidak boleh kosong");

  const existing = await db.subTeam.findUnique({ where: { id: subTeamId } });
  if (!existing) throw new Error("Sub tim tidak ditemukan");
  if (existing.deleted_at) throw new Error("Sub tim sudah dihapus, restore terlebih dahulu");

  const parentTeam = await db.team.findUnique({ where: { id: data.team_id } });
  if (!parentTeam) throw new Error("Tim induk tidak ditemukan");

  await db.subTeam.update({
    where: { id: subTeamId },
    data: {
      sub_team_name: data.sub_team_name.trim(),
      team_id: data.team_id,
      updated_by: actor.id,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}

/** Soft Delete Sub Team */
export async function softDeleteSubTeamAction(subTeamId: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.subTeam.findUnique({ where: { id: subTeamId } });
  if (!existing) throw new Error("Sub tim tidak ditemukan");
  if (existing.deleted_at) throw new Error("Sub tim sudah dihapus");

  await db.subTeam.update({
    where: { id: subTeamId },
    data: { deleted_at: new Date(), deleted_by: actor.id },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}

/** Restore Sub Team */
export async function restoreSubTeamAction(subTeamId: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.subTeam.findUnique({ where: { id: subTeamId } });
  if (!existing) throw new Error("Sub tim tidak ditemukan");
  if (!existing.deleted_at) throw new Error("Sub tim belum dihapus");

  await db.subTeam.update({
    where: { id: subTeamId },
    data: { deleted_at: null, deleted_by: null, updated_by: actor.id },
  });

  revalidatePath("/teams");
  revalidatePath("/admin");
  return { success: true };
}
