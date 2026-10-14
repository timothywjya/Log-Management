/**
 * USER CONTROLLER
 * Logika bisnis untuk manajemen user: approve, register, update profile.
 */

import { userRepository } from "@/lib/repositories/user.repository";
import { sanitizeString } from "@/lib/security/crypto";
import { getSession } from "@/lib/session";
import { isAdminUser } from "@/lib/config/admin";
import db from "@/lib/db";

/** Helper: fetch current user dengan JOIN program_group untuk deteksi admin */
async function getCurrentUserFull(nik: string) {
  return db.user.findUnique({
    where: { nik },
    include: { program_group: true },
  });
}

export async function registerProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sesi tidak valid" };

  const firstName = sanitizeString(formData.get("first_name") as string);
  const lastName  = sanitizeString(formData.get("last_name")  as string);
  const userEmail = sanitizeString(formData.get("user_email") as string);

  if (!firstName || !lastName || !userEmail) {
    return { error: "Semua field wajib diisi" };
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(userEmail)) return { error: "Format email tidak valid" };

  const user = await userRepository.findByNik(session.nik);
  if (!user) return { error: "User tidak ditemukan" };

  await userRepository.update(
    user.id,
    { first_name: firstName, last_name: lastName, user_email: userEmail } as any
  );

  return { success: true };
}

export async function approveUserRequest(
  targetUserId: string,
  teamId: string,
  subTeamId: string,
  groupId: string
) {
  const session = await getSession();
  if (!session) return { error: "Tidak terautentikasi" };

  // Cek admin via JOIN program_group
  const currentUser = await getCurrentUserFull(session.nik);
  if (!isAdminUser(currentUser)) {
    return { error: "Hanya Administrator yang dapat melakukan approve" };
  }

  const approver = await userRepository.findByNik(session.nik);
  if (!approver) return { error: "Approver tidak ditemukan" };

  await userRepository.approveUser(
    targetUserId, teamId, subTeamId, groupId,
    approver.id
  );

  return { success: true };
}

export async function getUsersByTeam(teamId?: string) {
  const session = await getSession();
  if (!session) return { error: "Tidak terautentikasi" };

  const currentUser = await getCurrentUserFull(session.nik);
  const isAdmin     = isAdminUser(currentUser);

  const resolvedTeamId = isAdmin ? teamId : (session.team_id ?? undefined);

  const users = await userRepository.findActiveUsers(resolvedTeamId ?? undefined);
  return { users };
}

export async function getPendingRequests() {
  const session = await getSession();
  if (!session) return { error: "Tidak terautentikasi" };

  const currentUser = await getCurrentUserFull(session.nik);
  if (!isAdminUser(currentUser)) return { error: "Akses ditolak" };

  const users = await userRepository.findGuestUsers();
  return { users };
}
