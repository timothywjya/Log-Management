
import Sidebar from "@/components/sidebar";
import TeamTable from "@/components/TeamTable";
import { getTeamData } from "@/components/SlugTeam"; 

export default async function ProgrammerPage() {
  const { teamMembers, currentUser } = await getTeamData(1); // Group Level 1

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