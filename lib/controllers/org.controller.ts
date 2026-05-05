/**
 * ORG CONTROLLER
 * Manajemen Team dan SubTeam secara dinamis.
 * Note: Role table dihapus — admin dideteksi via group_name='Administrator' atau is_admin flag.
 */

import {
  teamRepository,
  subTeamRepository,
} from "@/lib/repositories/org.repository";
import { sanitizeString } from "@/lib/security/crypto";
import { getSession } from "@/lib/session";
import { isAdminUser } from "@/lib/config/admin";
import db from "@/lib/db";

async function guardAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Akses ditolak: tidak terautentikasi");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true },
  });
  if (!isAdminUser(user)) throw new Error("Akses ditolak: hanya Administrator");
  return session;
}

// ─── Team CRUD ─────────────────────────────────────
export async function getAllTeams() {
  return teamRepository.findAllWithSubTeams();
}

export async function getTeamsByType(teamType: "programmer" | "support") {
  return teamRepository.findByType(teamType);
}

export async function createTeam(teamName: string, teamType: "programmer" | "support") {
  await guardAdmin();
  return teamRepository.create({
    team_name: sanitizeString(teamName),
    team_type: teamType,
  });
}

export async function updateTeam(id: string, teamName: string) {
  await guardAdmin();
  return teamRepository.update(id, { team_name: sanitizeString(teamName) });
}

// ─── SubTeam CRUD ──────────────────────────────────
export async function getSubTeamsByTeam(teamId: string) {
  return subTeamRepository.findByTeam(teamId);
}

export async function createSubTeam(subTeamName: string, teamId: string) {
  await guardAdmin();
  return subTeamRepository.create({
    sub_team_name: sanitizeString(subTeamName),
    team_id: teamId,
  });
}
