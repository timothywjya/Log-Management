import { PROGRAM_KEY_PREFIX } from "@/domain/program-key";
import type { GeneratedProgramKey } from "@/domain/entities/program";
import type { ProgramKeyService } from "@/application/ports/program-key.service";
import { createHash, randomBytes } from "node:crypto";

export class NodeProgramKeyService implements ProgramKeyService {
  /**
   * Format: lmk_ + 32 byte acak (base64url) = 256 bit entropi. Yang disimpan ke database
   * hanya hash dan prefix; `secret` hanya boleh ditampilkan ke user satu kali.
   */
  generate(): GeneratedProgramKey {
    const secret = PROGRAM_KEY_PREFIX + randomBytes(32).toString("base64url");
    return {
      secret,
      hash: this.hash(secret),
      prefix: secret.slice(0, 10), // "lmk_" + 6 karakter, hanya untuk identifikasi di UI
    };
  }

  // SHA-256 cukup untuk secret acak berentropi tinggi (berbeda dengan password manusia
  // yang butuh bcrypt/argon2).
  hash(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
  }
}
