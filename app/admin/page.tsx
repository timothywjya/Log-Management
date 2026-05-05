import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdminUser } from "@/lib/config/admin";
import db from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session!.nik },
    include: { program_group: true },
  });

  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/unauthorized");

  const [
    totalUsers,
    guestUsers,
    totalPrograms,
    activePrograms,
    teams,
    subTeams,
    programGroups,
    recentLogs,
  ] = await Promise.all([
    db.user.count({ where: { deleted_at: null } }),
    db.user.count({ where: { is_guest: true, deleted_at: null } }),
    db.program.count(),
    db.program.count({ where: { deleted_at: null } }),
    // Teams: include sub_teams + user count (tanpa program_group_teams)
    db.team.findMany({
      include: {
        sub_teams: { where: { deleted_at: null }, orderBy: { sub_team_name: "asc" } },
        _count: { select: { users: true } },
      },
      orderBy: [{ team_type: "asc" }, { team_name: "asc" }],
    }),
    db.subTeam.findMany({
      where: { deleted_at: null },
      orderBy: { sub_team_name: "asc" },
    }),
    // ProgramGroups: include tim programmer & support langsung via FK
    db.programGroup.findMany({
      where: { deleted_at: null },
      include: {
        programmer_team: true,
        support_team:    true,
        _count: { select: { programs: true, users: true } },
      },
      orderBy: { group_name: "asc" },
    }),
    db.logApi.findMany({ take: 5, orderBy: { created_at: "desc" } }),
  ]);

  const allUsers = await db.user.findMany({
    where: { deleted_at: null },
    include: { team: true, sub_team: true, program_group: true },
    orderBy: { created_at: "desc" },
    take: 100,
  });

  return (
    <AdminDashboardClient
      currentUser={user}
      stats={{
        totalUsers,
        guestUsers,
        totalPrograms,
        activePrograms,
        inactivePrograms: totalPrograms - activePrograms,
        totalTeams: teams.length,
        totalGroups: programGroups.length,
      }}
      teams={teams}
      subTeams={subTeams}
      programGroups={programGroups}
      allUsers={allUsers}
      recentLogs={recentLogs}
    />
  );
}
