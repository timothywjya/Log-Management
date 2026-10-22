import type { ProgramKeyService } from "@/application/ports/program-key.service";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { ReferenceRepository } from "@/application/ports/reference.repository";
import type { Actor } from "@/application/shared/actor";
import { fail, type Result } from "@/application/shared/result";
import { programSchema, type ProgramCommand, type ProgramWithKey } from "./program.schema";
import { resolveGroupId } from "./resolve-group";

export class CreateProgram {
  constructor(
    private readonly programs: ProgramRepository,
    private readonly reference: ReferenceRepository,
    private readonly keys: ProgramKeyService
  ) {}

  async execute(actor: Actor, input: ProgramCommand): Promise<Result<ProgramWithKey>> {
    const parsed = programSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const groupId = resolveGroupId(actor, parsed.data.groupId);
    if (!groupId) return fail("Group wajib dipilih (atau akun Anda belum punya group).");

    const [typeOk, groupOk] = await Promise.all([
      this.reference.programTypeExists(parsed.data.typeId),
      this.reference.groupExists(groupId),
    ]);
    if (!typeOk) return fail("Tipe program tidak valid.");
    if (!groupOk) return fail("Group tidak valid.");

    // Secret key otomatis dibuat bersamaan dengan program.
    const key = this.keys.generate();
    const program = await this.programs.create(
      { name: parsed.data.name, typeId: parsed.data.typeId, groupId },
      key,
      actor.id
    );

    return { ok: true, secretKey: key.secret, programName: program.program_name };
  }
}
