import { container } from "@/infrastructure/container";
import Sidebar from "@/presentation/components/sidebar";
import TeamTable from "@/presentation/components/TeamTable";
import { requireUser } from "@/presentation/guards/auth";

export default async function ProgrammerPage() {
  // Halaman tim hanya untuk admin (sama seperti menu "User Management" di sidebar).
  const currentUser = await requireUser({ admin: true });
  const teamMembers = await container.listTeamMembers.execute(1); // group level 1 = programmer

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={currentUser} />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-black mb-8">Team <span className="text-[#1db495]">Programmer</span></h1>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
          <TeamTable members={teamMembers} currentUser={currentUser} groupLevel={1} />
        </div>
      </main>
    </div>
  );
}
