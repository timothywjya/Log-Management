"use server";

import { UNAUTHORIZED } from "@/application/shared/result";
import { container } from "@/infrastructure/container";
import { getActionUser } from "@/presentation/guards/auth";
import { revalidatePath } from "next/cache";

function refresh() {
  revalidatePath("/users/request-member");
  revalidatePath("/dashboard");
}

export async function approveUser(userId: number, roleId: number, groupId: number) {
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;

  const result = await container.approveUser.execute(actor, userId, roleId, groupId);
  if (result.ok) refresh();
  return result;
}

export async function rejectUser(userId: number) {
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;

  const result = await container.rejectUser.execute(actor, userId);
  if (result.ok) refresh();
  return result;
}
