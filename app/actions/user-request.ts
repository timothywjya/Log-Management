"use server";

import db from "@/lib/db";
import { FORBIDDEN, UNAUTHORIZED, getActionUser, type ActionResult } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: number, roleId: number, groupId: number): Promise<ActionResult> {
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;
  if (!isAdmin(actor)) return FORBIDDEN;

  // Role 1 (Admin) tidak boleh diberikan lewat approval (form juga sudah menyembunyikannya).
  if (roleId === 1) return FORBIDDEN;

  const [target, role, group] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.role.findUnique({ where: { id: roleId }, select: { id: true } }),
    db.programGroup.findUnique({ where: { id: groupId }, select: { id: true } }),
  ]);

  if (!target || !target.is_guest || target.deleted_at) {
    return { ok: false, error: "Request tidak ditemukan atau sudah diproses." };
  }
  if (!target.first_name || !target.last_name || !target.user_email) {
    return { ok: false, error: "User belum melengkapi profil." };
  }
  if (!role || !group) return { ok: false, error: "Role atau group tidak valid." };

  await db.user.update({
    where: { id: userId },
    data: { role_id: role.id, group_id: group.id, is_guest: false, updated_by: actor.id },
  });

  revalidatePath("/users/request-member");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectUser(userId: number): Promise<ActionResult> {
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;
  if (!isAdmin(actor)) return FORBIDDEN;

  // Hanya akun guest yang boleh dihapus lewat jalur ini (bukan user yang sudah aktif).
  const result = await db.user.deleteMany({ where: { id: userId, is_guest: true } });
  if (result.count === 0) return { ok: false, error: "Request tidak ditemukan atau sudah diproses." };

  revalidatePath("/users/request-member");
  revalidatePath("/dashboard");
  return { ok: true };
}
