import { canManageProgram } from "@/domain/policies/permissions";
import type { ProgramKeyService } from "@/application/ports/program-key.service";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";
import type { ProgramWithKey } from "./program.schema";

/**
 * Generate ulang secret key. Dipakai untuk program lama yang belum punya key,
 * atau untuk rotasi jika key bocor. Key lama LANGSUNG tidak berlaku.
 */
export class RegenerateProgramKey {
  constructor(
    private readonly programs: ProgramRepository,
    private readonly keys: ProgramKeyService
  ) {}

  async execute(actor: Actor, id: number): Promise<Result<ProgramWithKey>> {
    const program = await this.programs.findById(id);
    if (!program) return fail("Program tidak ditemukan.");
    if (!canManageProgram(actor, program.program_group_id)) return FORBIDDEN;
    if (program.deleted_at) return fail("Program nonaktif. Restore dulu sebelum generate key.");

    const key = this.keys.generate();
    await this.programs.replaceKey(id, key, actor.id);
    return { ok: true, secretKey: key.secret, programName: program.program_name };
  }
}
