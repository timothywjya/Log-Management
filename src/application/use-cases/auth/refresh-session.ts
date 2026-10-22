import { toSessionPayload } from "@/domain/entities/session";
import type { SessionService } from "@/application/ports/session.service";
import type { UserRepository } from "@/application/ports/user.repository";

export type RefreshOutcome =
  | { status: "no-session" }
  | { status: "user-missing" }
  | { status: "refreshed"; isGuest: boolean };

/**
 * Membangun ulang isi sesi dari database, jadi perubahan role & status ikut terbawa
 * dan user yang sudah dinonaktifkan tidak bisa memperpanjang sesi.
 */
export class RefreshSession {
  constructor(
    private readonly users: UserRepository,
    private readonly session: SessionService
  ) {}

  async execute(): Promise<RefreshOutcome> {
    const current = await this.session.get();
    if (!current) return { status: "no-session" };

    const user = await this.users.findActiveByNik(current.nik);
    if (!user) return { status: "user-missing" };

    await this.session.start(toSessionPayload(user));
    return { status: "refreshed", isGuest: user.is_guest };
  }
}
