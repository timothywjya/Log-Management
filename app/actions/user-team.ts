"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: number, action: 'delete' | 'restore', currentUserId: number) {
  const data = action === 'delete' 
    ? { deleted_at: new Date(), deleted_by: currentUserId } 
    : { deleted_at: null, deleted_by: null };

  await db.user.update({
    where: { id: userId },
    data
  });

  revalidatePath("/users/team-programmer");
  revalidatePath("/users/team-support");
}