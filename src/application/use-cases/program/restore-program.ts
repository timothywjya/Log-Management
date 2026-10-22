import { canManageProgram } from "@/domain/policies/permissions";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";

export class RestoreProgram {
  constructor(private readonly programs: ProgramRepository) {}

  async execute(actor: Actor, id: number): Promise<Result> {
    const program = await this.programs.findById(id);
    if (!program) return fail("Program tidak ditemukan.");
    if (!canManageProgram(actor, program.program_group_id)) return FORBIDDEN;

    await this.programs.restore(id, actor.id);
    return { ok: true };
  }
}
