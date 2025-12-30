"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function getUserIdFromSession() {
  const session = await getSession();
  if (!session || !session.nik) return null;
  const user = await db.user.findUnique({
    where: { nik: session.nik },
    select: { id: true }
  });
  return user ? user.id : null;
}

export async function createProgram(data: { name: string; typeId: number; groupId: number }) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");

  await db.program.create({
    data: {
      program_name: data.name,
      program_type_id: data.typeId,
      program_group_id: data.groupId,
      created_by: userId,
    },
  });
  revalidatePath("/program");
}

export async function updateProgram(id: number, data: { name: string; typeId: number; groupId: number }) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");

  await db.program.update({
    where: { id },
    data: {
      program_name: data.name,
      program_type_id: data.typeId,
      program_group_id: data.groupId,
      updated_by: userId,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/program");
}

export async function deleteProgram(id: number) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");
  await db.program.update({
    where: { id },
    data: { deleted_at: new Date(), deleted_by: userId },
  });
  revalidatePath("/program");
}

export async function restoreProgram(id: number) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");
  await db.program.update({
    where: { id },
    data: { deleted_at: null, updated_by: userId },
  });
  revalidatePath("/program");
}