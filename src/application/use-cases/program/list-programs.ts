import type { ProgramType } from "@/domain/entities/program";
import type { ProgramWithRelations } from "@/domain/entities/program";
import type { ProgramGroup } from "@/domain/entities/user";
import { canSeeAllPrograms, type AccessUser } from "@/domain/policies/permissions";
import type { ProgramRepository } from "@/application/ports/program.repository";
import type { ReferenceRepository } from "@/application/ports/reference.repository";

export type ProgramListing = {
  programs: ProgramWithRelations[];
  types: ProgramType[];
  groups: ProgramGroup[];
  canSeeAll: boolean;
};

export class ListPrograms {
  constructor(
    private readonly programs: ProgramRepository,
    private readonly reference: ReferenceRepository
  ) {}

  async execute(user: AccessUser, query: string): Promise<ProgramListing> {
    const canSeeAll = canSeeAllPrograms(user);
    const [programs, types, groups] = await Promise.all([
      this.programs.list({ groupId: canSeeAll ? undefined : user.group_id || 0, query }),
      this.reference.listProgramTypes(),
      this.reference.listGroups(),
    ]);
    return { programs, types, groups, canSeeAll };
  }
}
