import type { UserWithAccess } from "@/domain/entities/user";
import type { SessionService } from "@/application/ports/session.service";
import type { UserRepository } from "@/application/ports/user.repository";

export type SessionUserOutcome =
  | { status: "no-session" }
  | { status: "inactive" } // sesi masih valid, tetapi user sudah dihapus/dinonaktifkan
  | { status: "ok"; user: UserWithAccess };

/**
 * Selalu cek ke database, jadi user yang sudah dinonaktifkan atau dihapus langsung
 * kehilangan akses (tidak menunggu JWT habis).
 */
export class GetSessionUser {
  constructor(
    private readonly users: UserRepository,
    private readonly session: SessionService
  ) {}

  async execute(): Promise<SessionUserOutcome> {
    const current = await this.session.get();
    if (!current?.nik) return { status: "no-session" };

    const user = await this.users.findActiveByNik(current.nik);
    return user ? { status: "ok", user } : { status: "inactive" };
  }
}
