import prisma from "@/lib/db";
import { Team, SubTeam } from "@prisma/client";
import { BaseRepository } from "./base.repository";

// ─── Team Repository ──────────────────────────────
export class TeamRepository extends BaseRepository<Team, any, any> {
  protected modelName = "team" as const;

  async findAllWithSubTeams() {
    return prisma.team.findMany({
      include: { sub_teams: true },
      orderBy: { team_name: "asc" },
    });
  }

  async findByType(teamType: "programmer" | "support") {
    return prisma.team.findMany({
      where: { team_type: teamType },
      include: { sub_teams: true },
      orderBy: { team_name: "asc" },
    });
  }
}

// ─── SubTeam Repository ──────────────────────────
export class SubTeamRepository extends BaseRepository<SubTeam, any, any> {
  protected modelName = "subTeam" as const;

  async findByTeam(teamId: string): Promise<SubTeam[]> {
    return prisma.subTeam.findMany({
      where: { team_id: teamId },
      orderBy: { sub_team_name: "asc" },
    });
  }
}

export const teamRepository    = new TeamRepository();
export const subTeamRepository = new SubTeamRepository();
