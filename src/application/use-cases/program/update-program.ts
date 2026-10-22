import { canManageProgram } from "@/domain/policies/permissions";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";
import { programSchema, type ProgramCommand } from "./program.schema";
import { resolveGroupId } from "./resolve-group";

export class UpdateProgram {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(actor: Actor, id: number, input: ProgramCommand): Promise<Result> {
    const parsed = programSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const program = await this.programs.findById(id);
    if (!program) return fail("Program tidak ditemukan.");
    if (!canManageProgram(actor, program.program_group_id)) return FORBIDDEN;
    if (program.deleted_at) return fail("Program nonaktif tidak bisa diedit. Restore dulu.");

    const groupId = resolveGroupId(actor, parsed.data.groupId) ?? program.program_group_id;

    await this.programs.update(id, { name: parsed.data.name, typeId: parsed.data.typeId, groupId }, actor.id);
    return { ok: true };
  }
}
