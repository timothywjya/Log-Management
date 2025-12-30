"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: number, roleId: number, groupId: number) {
  await db.user.update({
    where: { id: userId },
    data: {
      role_id: roleId,
      group_id: groupId,
      is_guest: false, 
    },
  });

  revalidatePath("/users/request-member");
}

export async function rejectUser(userId: number) {
  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/users/request-member");
}