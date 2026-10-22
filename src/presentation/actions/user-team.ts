"use server";

import { UNAUTHORIZED } from "@/application/shared/result";
import { container } from "@/infrastructure/container";
import { getActionUser } from "@/presentation/guards/auth";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: number, action: "delete" | "restore") {
  // Pelaku diambil dari sesi, bukan dikirim dari client (bisa dipalsukan).
  const actor = await getActionUser();
  if (!actor) return UNAUTHORIZED;

  const result = await container.toggleUserStatus.execute(actor, userId, action);
  if (result.ok) {
    revalidatePath("/users/team-programmer");
    revalidatePath("/users/team-support");
  }
  return result;
}
