"use server";

import type { ProgramCommand } from "@/application/use-cases/program/program.schema";
import { UNAUTHORIZED } from "@/application/shared/result";
import { container } from "@/infrastructure/container";
import { getActionUser } from "@/presentation/guards/auth";
import { revalidatePath } from "next/cache";

function refresh() {
  revalidatePath("/program");
  revalidatePath("/dashboard");
}

export async function createProgram(input: ProgramCommand) {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const result = await container.createProgram.execute(user, input);
  if (result.ok) refresh();
  return result;
}

export async function updateProgram(id: number, input: ProgramCommand) {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const result = await container.updateProgram.execute(user, id, input);
  if (result.ok) refresh();
  return result;
}

export async function deleteProgram(id: number) {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const result = await container.deleteProgram.execute(user, id);
  if (result.ok) refresh();
  return result;
}

export async function restoreProgram(id: number) {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const result = await container.restoreProgram.execute(user, id);
  if (result.ok) refresh();
  return result;
}

export async function regenerateProgramKey(id: number) {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const result = await container.regenerateProgramKey.execute(user, id);
  if (result.ok) refresh();
  return result;
}
