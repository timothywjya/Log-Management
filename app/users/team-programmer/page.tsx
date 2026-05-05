import Sidebar from "@/components/sidebar";
import TeamTable from "@/components/TeamTable";
import { getTeamData } from "@/components/SlugTeam";
import { Code2 } from "lucide-react";

export default async function ProgrammerPage() {
  const { grouped, currentUser, role } = await getTeamData("programmer");

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={currentUser} />
      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <Code2 size={20} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Tim <span className="text-violet-600">Programmer</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {role === "administrator" ? "Semua tim programmer" : "Tim programmer Anda"}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
              <Code2 size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium">Belum ada anggota tim programmer</p>
            </div>
          ) : (
            Object.values(grouped).map(({ team, members }) => (
              <div key={team?.id ?? "unassigned"} className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                    <h2 className="font-bold text-slate-800 text-sm">{team?.team_name ?? "Unassigned"}</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                    {members.length} anggota
                  </span>
                </div>
                <TeamTable members={members} currentUser={currentUser} teamType="programmer" />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
