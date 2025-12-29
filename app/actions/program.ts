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

export async function createProgram(formData: {
  name: string;
  typeId: number;
  groupId: number;
}) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized: User ID not found");

  await db.program.create({
    data: {
      program_name: formData.name,
      program_type_id: Number(formData.typeId),
      program_group_id: Number(formData.groupId),
      created_by: userId, 
    },
  });

  revalidatePath("/program");
  revalidatePath("/dashboard");
}

export async function updateProgram(id: number, formData: {
  name: string;
  typeId: number;
  groupId: number;
}) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");

  await db.program.update({
    where: { id },
    data: {
      program_name: formData.name,
      program_type_id: Number(formData.typeId),
      program_group_id: Number(formData.groupId),
      updated_by: userId,
      updatedAt: new Date(), 
    },
  });

  revalidatePath("/program");
  revalidatePath("/dashboard");
}

export async function deleteProgram(id: number) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("You must be logged in to perform this action");

  await db.program.update({
    where: { id },
    data: {
      deleted_at: new Date(),
      deleted_by: userId, 
    },
  });

  revalidatePath("/program");
  revalidatePath("/dashboard");
}

export async function restoreProgram(id: number) {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Unauthorized");

  await db.program.update({
    where: { id },
    data: {
      deleted_at: null,
      deleted_by: null,
      updated_by: userId,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/program");
  revalidatePath("/dashboard");
}