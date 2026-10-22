import { canManageTeamMember, isAdmin } from "@/domain/policies/permissions";
import type { UserRepository } from "@/application/ports/user.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";

export class ToggleUserStatus {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor, userId: number, action: "delete" | "restore"): Promise<Result> {
    if (!isAdmin(actor)) return FORBIDDEN;

    const target = await this.users.findById(userId);
    if (!target) return fail("User tidak ditemukan.");
    if (target.id === actor.id) return fail("Anda tidak bisa menonaktifkan akun sendiri.");
    if (!canManageTeamMember(actor, target.role?.group_level ?? null)) return FORBIDDEN;

    await this.users.setDeleted(userId, action === "delete", actor.id);
    return { ok: true };
  }
}
