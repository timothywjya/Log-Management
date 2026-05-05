"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminUser, isManagerUser } from "@/lib/config/admin";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

// ─── Helpers ──────────────────────────────────────────────────

function generateSecretKey(): string {
  return randomBytes(32).toString("hex");
}

function generateIV(): string {
  return randomBytes(16).toString("hex");
}

async function getSessionUser() {
  const session = await getSession();
  if (!session?.nik) return null;
  return db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true, team: true },
  });
}

async function guardLoggedIn() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu");
  return user;
}

async function guardAdminOrManager() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!isAdminUser(user) && !isManagerUser(user)) {
    throw new Error("Forbidden: Hanya Administrator atau Manager yang dapat melakukan aksi ini");
  }
  return user;
}

// CREATE — semua user yang login
export async function createProgram(data: {
  name: string;
  typeId: string;
  groupId: string;
}) {
  const actor = await guardLoggedIn();

  if (!data.name.trim()) throw new Error("Nama program tidak boleh kosong");
  if (!data.typeId) throw new Error("Tipe program wajib dipilih");
  if (!data.groupId) throw new Error("Group program wajib dipilih");

  const secret_key = generateSecretKey();
  const iv = generateIV();

  await db.program.create({
    data: {
      program_name:     data.name.trim(),
      program_type_id:  data.typeId,
      program_group_id: data.groupId,
      secret_key,
      iv,
      created_by: actor.id,
    },
  });

  revalidatePath("/program");
}

// UPDATE — hanya Admin & Manager
export async function updateProgram(
  id: string,
  data: { name: string; typeId: string; groupId: string }
) {
  const actor = await guardAdminOrManager();

  if (!data.name.trim()) throw new Error("Nama program tidak boleh kosong");

  const existing = await db.program.findUnique({ where: { id } });
  if (!existing) throw new Error("Program tidak ditemukan");
  if (existing.deleted_at) throw new Error("Program sudah dihapus, restore terlebih dahulu");

  await db.program.update({
    where: { id },
    data: {
      program_name:     data.name.trim(),
      program_type_id:  data.typeId,
      program_group_id: data.groupId,
      updated_at:       new Date(),
      updated_by:       actor.id,
    },
  });

  revalidatePath("/program");
}

// SOFT DELETE — hanya Admin & Manager
export async function deleteProgram(id: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.program.findUnique({ where: { id } });
  if (!existing) throw new Error("Program tidak ditemukan");
  if (existing.deleted_at) throw new Error("Program sudah dihapus");

  await db.program.update({
    where: { id },
    data: { deleted_at: new Date(), deleted_by: actor.id },
  });

  revalidatePath("/program");
}

// RESTORE — hanya Admin & Manager
export async function restoreProgram(id: string) {
  const actor = await guardAdminOrManager();

  const existing = await db.program.findUnique({ where: { id } });
  if (!existing) throw new Error("Program tidak ditemukan");
  if (!existing.deleted_at) throw new Error("Program masih aktif");

  await db.program.update({
    where: { id },
    data: { deleted_at: null, deleted_by: null, updated_by: actor.id },
  });

  revalidatePath("/program");
}

// BACKFILL — generate secret untuk program lama (Admin only)
export async function backfillProgramSecrets() {
  const actor = await guardAdminOrManager();
  if (!isAdminUser(actor)) throw new Error("Hanya Administrator");

  const programs = await db.program.findMany({
    where: { OR: [{ secret_key: null }, { iv: null }] },
  });

  let count = 0;
  for (const p of programs) {
    await db.program.update({
      where: { id: p.id },
      data: {
        secret_key: p.secret_key ?? generateSecretKey(),
        iv:         p.iv         ?? generateIV(),
      },
    });
    count++;
  }

  revalidatePath("/program");
  return { backfilled: count };
}
