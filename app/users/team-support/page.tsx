import Sidebar from "@/components/sidebar";
import { getTeamData } from "@/components/SlugTeam";
import TeamTable from "@/components/TeamTable";

export default async function SupportPage() {
  const { teamMembers, currentUser } = await getTeamData(2); 

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={currentUser} />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-black mb-8">
            Team <span className="text-blue-500">Support</span>
        </h1>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
          <TeamTable 
            members={teamMembers} 
            currentUser={currentUser} 
            groupLevel={2} 
          />
        </div>
      </main>
    </div>
  );
}