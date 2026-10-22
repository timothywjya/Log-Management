import type { UserWithAccess } from "@/domain/entities/user";
import { canSeeAllPrograms, isAdmin } from "@/domain/policies/permissions";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { UserRepository } from "@/application/ports/user.repository";

export type DashboardSummary = {
  isAdmin: boolean;
  totalUsers: number;
  pendingRequests: number;
  totalPrograms: number;
  activePrograms: number;
  inactivePrograms: number;
};

export class GetDashboardSummary {
  constructor(
    private readonly users: UserRepository,
    private readonly programs: ProgramRepository
  ) {}

  async execute(user: UserWithAccess): Promise<DashboardSummary> {
    const admin = isAdmin(user);
    const canSeeAll = canSeeAllPrograms(user);

    const [totalUsers, pendingRequests, statuses] = await Promise.all([
      this.users.countActive({ groupId: canSeeAll ? undefined : user.group_id }),
      admin ? this.users.countPendingGuests() : Promise.resolve(0),
      this.programs.listStatuses({ groupId: canSeeAll ? undefined : user.group_id || 0 }),
    ]);

    const activePrograms = statuses.filter((p) => p.deleted_at === null).length;
    return {
      isAdmin: admin,
      totalUsers,
      pendingRequests,
      totalPrograms: statuses.length,
      activePrograms,
      inactivePrograms: statuses.length - activePrograms,
    };
  }
}
