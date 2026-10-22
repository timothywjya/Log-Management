import type { UserWithAccess } from "@/domain/entities/user";
import type { UserRepository } from "@/application/ports/user.repository";

/** groupLevel: 1 = programmer, 2 = support. */
export class ListTeamMembers {
  constructor(private readonly users: UserRepository) {}

  execute(groupLevel: number): Promise<UserWithAccess[]> {
    return this.users.listMembersByGroupLevel(groupLevel);
  }
}
