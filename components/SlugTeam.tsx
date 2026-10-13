import db from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function getTeamData(groupLevel: number) {
  // Halaman tim hanya untuk admin (sama seperti menu "User Management" di sidebar).
  const currentUser = await requireUser({ admin: true });

  const teamMembers = await db.user.findMany({
    where: {
      is_guest: false,
      role: { group_level: groupLevel },
    },
    include: {
      role: true,
      program_group: true,
    },
    orderBy: { first_name: 'asc' },
  });

  return { teamMembers, currentUser };
}
