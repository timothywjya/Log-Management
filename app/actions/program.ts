"use server";

import db from "@/lib/db";
import { FORBIDDEN, UNAUTHORIZED, getActionUser, type ActionResult } from "@/lib/auth";
import { canManageProgram, isLockedToOwnGroup } from "@/lib/permissions";
import { generateProgramKey } from "@/lib/program-key";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const programSchema = z.object({
  name: z.string().trim().min(1, "Nama program wajib diisi").max(255),
  typeId: z.number().int().positive("Tipe program wajib dipilih"),
  groupId: z.number().int().nonnegative().optional(),
});

type ProgramInput = { name: string; typeId: number; groupId?: number };
type WithKey = { secretKey: string; programName: string };

function refresh() {
  revalidatePath("/program");
  revalidatePath("/dashboard");
}

/** Group final ditentukan SERVER: role 2/3 selalu dikunci ke group miliknya. */
function resolveGroupId(
  user: { role_id: number | null; group_id: number | null },
  requested?: number
) {
  return isLockedToOwnGroup(user) ? user.group_id : requested ?? null;
}

export async function createProgram(input: ProgramInput): Promise<ActionResult<WithKey>> {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const parsed = programSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const groupId = resolveGroupId(user, parsed.data.groupId);
  if (!groupId) return { ok: false, error: "Group wajib dipilih (atau akun Anda belum punya group)." };

  const [type, group] = await Promise.all([
    db.programType.findUnique({ where: { id: parsed.data.typeId }, select: { id: true } }),
    db.programGroup.findUnique({ where: { id: groupId }, select: { id: true } }),
  ]);
  if (!type) return { ok: false, error: "Tipe program tidak valid." };
  if (!group) return { ok: false, error: "Group tidak valid." };

  // Secret key otomatis dibuat bersamaan dengan program.
  const key = generateProgramKey();
  const program = await db.program.create({
    data: {
      program_name: parsed.data.name,
      program_type_id: type.id,
      program_group_id: group.id,
      created_by: user.id,
      secret_key_hash: key.hash,
      secret_key_prefix: key.prefix,
      secret_key_generated_at: new Date(),
      secret_key_generated_by: user.id,
    },
    select: { program_name: true },
  });

  refresh();
  return { ok: true, secretKey: key.secret, programName: program.program_name };
}

export async function updateProgram(id: number, input: ProgramInput): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const parsed = programSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const program = await db.program.findUnique({
    where: { id },
    select: { program_group_id: true, deleted_at: true },
  });
  if (!program) return { ok: false, error: "Program tidak ditemukan." };
  if (!canManageProgram(user, program.program_group_id)) return FORBIDDEN;
  if (program.deleted_at) return { ok: false, error: "Program nonaktif tidak bisa diedit. Restore dulu." };

  const groupId = resolveGroupId(user, parsed.data.groupId) ?? program.program_group_id;

  await db.program.update({
    where: { id },
    data: {
      program_name: parsed.data.name,
      program_type_id: parsed.data.typeId,
      program_group_id: groupId,
      updated_by: user.id,
    },
  });
  refresh();
  return { ok: true };
}

export async function deleteProgram(id: number): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const program = await db.program.findUnique({ where: { id }, select: { program_group_id: true } });
  if (!program) return { ok: false, error: "Program tidak ditemukan." };
  if (!canManageProgram(user, program.program_group_id)) return FORBIDDEN;

  // Soft delete. Selama nonaktif, secret key-nya otomatis tidak diterima (lihat findProgramByKey).
  await db.program.update({ where: { id }, data: { deleted_at: new Date(), deleted_by: user.id } });
  refresh();
  return { ok: true };
}

export async function restoreProgram(id: number): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const program = await db.program.findUnique({ where: { id }, select: { program_group_id: true } });
  if (!program) return { ok: false, error: "Program tidak ditemukan." };
  if (!canManageProgram(user, program.program_group_id)) return FORBIDDEN;

  await db.program.update({
    where: { id },
    data: { deleted_at: null, deleted_by: null, updated_by: user.id },
  });
  refresh();
  return { ok: true };
}

/**
 * Generate ulang secret key. Dipakai untuk program lama yang belum punya key,
 * atau untuk rotasi jika key bocor. Key lama LANGSUNG tidak berlaku.
 */
export async function regenerateProgramKey(id: number): Promise<ActionResult<WithKey>> {
  const user = await getActionUser();
  if (!user) return UNAUTHORIZED;

  const program = await db.program.findUnique({
    where: { id },
    select: { program_name: true, program_group_id: true, deleted_at: true },
  });
  if (!program) return { ok: false, error: "Program tidak ditemukan." };
  if (!canManageProgram(user, program.program_group_id)) return FORBIDDEN;
  if (program.deleted_at) return { ok: false, error: "Program nonaktif. Restore dulu sebelum generate key." };

  const key = generateProgramKey();
  await db.program.update({
    where: { id },
    data: {
      secret_key_hash: key.hash,
      secret_key_prefix: key.prefix,
      secret_key_generated_at: new Date(),
      secret_key_generated_by: user.id,
      updated_by: user.id,
    },
  });

  refresh();
  return { ok: true, secretKey: key.secret, programName: program.program_name };
}
