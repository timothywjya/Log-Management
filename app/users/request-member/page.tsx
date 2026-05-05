import RequestTable from "@/components/RequestTable";
import Sidebar from "@/components/sidebar";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminUser, isManagerUser } from "@/lib/config/admin";
import { redirect } from "next/navigation";

export default async function RequestMemberPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { nik: session!.nik },
    include: { team: true, sub_team: true, program_group: true },
  });

  if (!currentUser) redirect("/login");
  if (!isAdminUser(currentUser) && !isManagerUser(currentUser)) redirect("/unauthorized");

  const guestUsers = await db.user.findMany({
    where: { is_guest: true },
    orderBy: { created_at: "desc" },
  });

  // Sertakan sub_teams agar dropdown sub-team bisa muncul di RequestTable
  const teams = await db.team.findMany({
    include: { sub_teams: true },
    orderBy: { team_name: "asc" },
  });

  const groups = await db.programGroup.findMany({ orderBy: { group_name: "asc" } });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={currentUser} />
      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            User <span className="text-[#1db495]">Requests</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5 italic">
            Permintaan akun yang menunggu persetujuan •{" "}
            <span className="font-bold text-amber-600">{guestUsers.length} pending</span>
          </p>
        </header>

        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <RequestTable users={guestUsers} teams={teams} groups={groups} />
        </div>
      </main>
    </div>
  );
}
