import { isAdmin } from "@/domain/policies/permissions";
import type { UserRepository } from "@/application/ports/user.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";

export class RejectUser {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor, userId: number): Promise<Result> {
    if (!isAdmin(actor)) return FORBIDDEN;

    // Hanya akun guest yang boleh dihapus lewat jalur ini (bukan user yang sudah aktif).
    const deleted = await this.users.deleteGuest(userId);
    if (!deleted) return fail("Request tidak ditemukan atau sudah diproses.");
    return { ok: true };
  }
}
