import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdminUser, isManagerUser } from "@/lib/config/admin";
import db from "@/lib/db";
import TeamsClient from "./TeamsClient";

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { program_group: true, team: true },
  });

  if (!user) redirect("/login");
  if (!isAdminUser(user) && !isManagerUser(user)) redirect("/unauthorized");

  // Ambil semua teams dengan sub_teams + jumlah users (termasuk yang di-soft-delete)
  const teams = await db.team.findMany({
    include: {
      sub_teams: {
        orderBy: { sub_team_name: "asc" },
      },
      _count: { select: { users: true } },
    },
    orderBy: [{ team_type: "asc" }, { team_name: "asc" }],
  });

  return (
    <TeamsClient
      currentUser={user}
      teams={teams}
    />
  );
}
