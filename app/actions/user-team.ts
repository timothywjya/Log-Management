"use server";

import db from "@/lib/db";
import { FORBIDDEN, UNAUTHORIZED, getActionUser, type ActionResult } from "@/lib/auth";
import { canManageTeamMember, isAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: number, action: "delete" | "restore"): Promise<ActionResult> {
  // Pelaku diambil dari sesi. Sebelumnya `currentUserId` dikirim dari client
  // sehingga bisa dipalsukan dan tidak ada pengecekan hak akses sama sekali.
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;
  if (!isAdmin(actor)) return FORBIDDEN;

  const target = await db.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!target) return { ok: false, error: "User tidak ditemukan." };
  if (target.id === actor.id) return { ok: false, error: "Anda tidak bisa menonaktifkan akun sendiri." };
  if (!canManageTeamMember(actor, target.role?.group_level ?? null)) return FORBIDDEN;

  await db.user.update({
    where: { id: userId },
    data:
      action === "delete"
        ? { deleted_at: new Date(), deleted_by: actor.id }
        : { deleted_at: null, deleted_by: null },
  });

  revalidatePath("/users/team-programmer");
  revalidatePath("/users/team-support");
  return { ok: true };
}
