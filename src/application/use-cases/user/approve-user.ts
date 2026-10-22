import { ADMIN_ROLE_ID, isAdmin } from "@/domain/policies/permissions";
import type { ReferenceRepository } from "@/application/ports/reference.repository";
import type { UserRepository } from "@/application/ports/user.repository";
import type { Actor } from "@/application/shared/actor";
import { FORBIDDEN, fail, type Result } from "@/application/shared/result";

export class ApproveUser {
  constructor(
    private readonly users: UserRepository,
    private readonly reference: ReferenceRepository
  ) {}

  async execute(actor: Actor, userId: number, roleId: number, groupId: number): Promise<Result> {
    if (!isAdmin(actor)) return FORBIDDEN;

    // Role Admin tidak boleh diberikan lewat approval (form juga sudah menyembunyikannya).
    if (roleId === ADMIN_ROLE_ID) return FORBIDDEN;

    const [target, roleOk, groupOk] = await Promise.all([
      this.users.findById(userId),
      this.reference.roleExists(roleId),
      this.reference.groupExists(groupId),
    ]);

    if (!target || !target.is_guest || target.deleted_at) {
      return fail("Request tidak ditemukan atau sudah diproses.");
    }
    if (!target.first_name || !target.last_name || !target.user_email) {
      return fail("User belum melengkapi profil.");
    }
    if (!roleOk || !groupOk) return fail("Role atau group tidak valid.");

    await this.users.approveGuest(userId, roleId, groupId, actor.id);
    return { ok: true };
  }
}
