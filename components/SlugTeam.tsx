
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function getTeamData(groupLevel: number) {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { nik: session.nik },
    include: { role: true }
  });

  if (!currentUser) redirect("/login");

  const teamMembers = await db.user.findMany({
    where: {
      is_guest: false,
      role: { group_level: groupLevel }
    },
    include: {
      role: true,
      program_group: true
    },
    orderBy: { first_name: 'asc' }
  });

  return { teamMembers, currentUser };
}