import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveRole } from "@/lib/config/admin";
import { redirect } from "next/navigation";

/**
 * getTeamData — mengambil anggota berdasarkan team_type dari Teams tabel.
 * teamType: "programmer" | "support"
 * Administrator: akses semua
 * Manager: hanya akses timnya sendiri
 */
export async function getTeamData(teamType: "programmer" | "support") {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { nik: session!.nik },
    include: { team: true, sub_team: true, program_group: true },
  });

  if (!currentUser) redirect("/login");

  const role = resolveRole(currentUser);

  // Akses kontrol
  if (role === "staff") redirect("/unauthorized");
  if (role === "manager_programmer" && teamType !== "programmer") redirect("/unauthorized");
  if (role === "manager_support"    && teamType !== "support")    redirect("/unauthorized");

  // Admin lihat semua team sesuai tipe
  // Manager hanya lihat tim sendiri
  const isAdmin = role === "administrator";

  const teamsWhere = isAdmin
    ? { team_type: teamType }
    : { team_type: teamType, id: currentUser.team_id ?? "__none__" };

  const teams = await db.team.findMany({
    where: teamsWhere,
    include: { sub_teams: true },
    orderBy: { team_name: "asc" },
  });

  const teamIds = teams.map((t: any) => t.id);

  const teamMembers = await db.user.findMany({
    where: {
      team_id:    { in: teamIds.length > 0 ? teamIds : ["__none__"] },
      deleted_at: null,
    },
    include: { team: true, sub_team: true, program_group: true },
    orderBy: [{ team_id: "asc" }, { first_name: "asc" }],
  });

  // Kelompokkan per team
  const grouped: Record<string, { team: any; members: any[] }> = {};
  for (const member of teamMembers) {
    const tid = member.team_id ?? "unassigned";
    if (!grouped[tid]) grouped[tid] = { team: member.team, members: [] };
    grouped[tid].members.push(member);
  }

  return { grouped, currentUser, role, allTeams: teams };
}
