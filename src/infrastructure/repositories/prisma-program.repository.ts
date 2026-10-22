import type { AuthenticatedProgram, GeneratedProgramKey, ProgramWithRelations } from "@/domain/entities/program";
import type { ProgramInput, ProgramRepository } from "@/application/ports/program.repository";
import { prisma as db } from "@/infrastructure/prisma/client";

const groupFilter = (groupId?: number) => (groupId === undefined ? {} : { program_group_id: groupId });

const keyColumns = (key: GeneratedProgramKey, by: number) => ({
  secret_key_hash: key.hash,
  secret_key_prefix: key.prefix,
  secret_key_generated_at: new Date(),
  secret_key_generated_by: by,
});

export class PrismaProgramRepository implements ProgramRepository {
  list(filter: { groupId?: number; query: string }): Promise<ProgramWithRelations[]> {
    return db.program.findMany({
      where: {
        ...groupFilter(filter.groupId),
        // Postgres case-sensitive; mode: insensitive menjaga perilaku pencarian lama (MySQL).
        program_name: { contains: filter.query, mode: "insensitive" },
      },
      select: {
        id: true,
        program_name: true,
        program_type_id: true,
        program_group_id: true,
        deleted_at: true,
        secret_key_prefix: true,
        secret_key_generated_at: true,
        program_type: true,
        program_group: true,
      },
      orderBy: { program_name: "asc" },
    });
  }

  listStatuses(filter: { groupId?: number }) {
    return db.program.findMany({ where: groupFilter(filter.groupId), select: { deleted_at: true } });
  }

  listNames(filter: { groupId?: number }) {
    return db.program.findMany({
      where: groupFilter(filter.groupId),
      select: { id: true, program_name: true },
      orderBy: { program_name: "asc" },
    });
  }

  findById(id: number) {
    return db.program.findUnique({
      where: { id },
      select: { program_name: true, program_group_id: true, deleted_at: true },
    });
  }

  findByKeyHash(hash: string): Promise<AuthenticatedProgram | null> {
    return db.program.findFirst({
      where: { secret_key_hash: hash, deleted_at: null },
      select: { id: true, program_name: true, program_group_id: true, program_type_id: true },
    });
  }

  create(input: ProgramInput, key: GeneratedProgramKey, createdBy: number) {
    return db.program.create({
      data: {
        program_name: input.name,
        program_type_id: input.typeId,
        program_group_id: input.groupId,
        created_by: createdBy,
        ...keyColumns(key, createdBy),
      },
      select: { program_name: true },
    });
  }

  async update(id: number, input: ProgramInput, updatedBy: number): Promise<void> {
    await db.program.update({
      where: { id },
      data: {
        program_name: input.name,
        program_type_id: input.typeId,
        program_group_id: input.groupId,
        updated_by: updatedBy,
      },
    });
  }

  async softDelete(id: number, by: number): Promise<void> {
    await db.program.update({ where: { id }, data: { deleted_at: new Date(), deleted_by: by } });
  }

  async restore(id: number, by: number): Promise<void> {
    await db.program.update({ where: { id }, data: { deleted_at: null, deleted_by: null, updated_by: by } });
  }

  async replaceKey(id: number, key: GeneratedProgramKey, by: number): Promise<void> {
    await db.program.update({ where: { id }, data: { ...keyColumns(key, by), updated_by: by } });
  }
}
