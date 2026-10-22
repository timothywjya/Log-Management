import type { AuthenticatedProgram } from "@/domain/entities/program";
import { isProgramKeyFormat } from "@/domain/program-key";
import type { ProgramKeyService } from "@/application/ports/program-key.service";
import type { ProgramRepository } from "@/application/ports/program.repository";

/**
 * Mencari program AKTIF berdasarkan secret key. Dipakai endpoint penerima log untuk
 * memastikan log datang dari program yang sah.
 */
export class AuthenticateProgramKey {
  constructor(
    private readonly programs: ProgramRepository,
    private readonly keys: ProgramKeyService
  ) {}

  async execute(secret: string | null | undefined): Promise<AuthenticatedProgram | null> {
    if (!isProgramKeyFormat(secret)) return null;
    return this.programs.findByKeyHash(this.keys.hash(secret));
  }
}
