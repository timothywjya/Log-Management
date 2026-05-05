"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// Approve: set team_id, sub_team_id (optional), group_id, is_guest = false
export async function approveUser(
  userId: string,
  teamId: string,
  groupId: string,
  subTeamId?: string
) {
  await db.user.update({
    where: { id: userId },
    data: {
      team_id:     teamId || null,
      sub_team_id: subTeamId || null,
      group_id:    groupId || null,
      is_guest:    false,
    },
  });
  revalidatePath("/users/request-member");
}

export async function rejectUser(userId: string) {
  await db.user.delete({ where: { id: userId } });
  revalidatePath("/users/request-member");
}
