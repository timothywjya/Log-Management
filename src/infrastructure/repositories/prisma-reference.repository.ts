import type { ReferenceRepository } from "@/application/ports/reference.repository";
import { prisma as db } from "@/infrastructure/prisma/client";

export class PrismaReferenceRepository implements ReferenceRepository {
  listRoles(opts: { excludeId?: number } = {}) {
    return db.role.findMany({ where: opts.excludeId === undefined ? {} : { id: { not: opts.excludeId } } });
  }

  listGroups() {
    return db.programGroup.findMany();
  }

  listProgramTypes() {
    return db.programType.findMany();
  }

  async roleExists(id: number) {
    return (await db.role.findUnique({ where: { id }, select: { id: true } })) !== null;
  }

  async groupExists(id: number) {
    return (await db.programGroup.findUnique({ where: { id }, select: { id: true } })) !== null;
  }

  async programTypeExists(id: number) {
    return (await db.programType.findUnique({ where: { id }, select: { id: true } })) !== null;
  }

  async findProgramTypeName(id: number) {
    const type = await db.programType.findUnique({ where: { id }, select: { program_type: true } });
    return type?.program_type ?? null;
  }
}
