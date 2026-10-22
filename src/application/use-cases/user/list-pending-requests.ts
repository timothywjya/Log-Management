import type { ProgramGroup, Role, User } from "@/domain/entities/user";
import { ADMIN_ROLE_ID } from "@/domain/policies/permissions";
import type { ReferenceRepository } from "@/application/ports/reference.repository";
import type { UserRepository } from "@/application/ports/user.repository";

export type PendingRequests = { users: User[]; roles: Role[]; groups: ProgramGroup[] };

export class ListPendingRequests {
  constructor(
    private readonly users: UserRepository,
    private readonly reference: ReferenceRepository
  ) {}

  async execute(): Promise<PendingRequests> {
    const [users, roles, groups] = await Promise.all([
      this.users.listPendingGuests(),
      this.reference.listRoles({ excludeId: ADMIN_ROLE_ID }),
      this.reference.listGroups(),
    ]);
    return { users, roles, groups };
  }
}
