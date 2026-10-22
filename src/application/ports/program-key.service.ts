import type { GeneratedProgramKey } from "@/domain/entities/program";

export interface ProgramKeyService {
  generate(): GeneratedProgramKey;
  hash(secret: string): string;
}
