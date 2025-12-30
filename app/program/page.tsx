import CreateProgramModal from "@/components/modal/ProgramModal";
import ProgramActions from "@/components/ProgramActions";
import SearchInput from "@/components/SearchInput";
import Sidebar from "@/components/sidebar";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { Code, Database as DbIcon, Globe, Laptop, Settings, Smartphone } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { role: true, program_group: true }
  });

  if (!user) redirect("/login");

  const query = (await searchParams).query || "";
  const isSuperAdmin = user.role_id === 1 || user.group_id === 6;
  const canSeeAll = isSuperAdmin || user.role_id === 4 || user.role_id === 5;

  const programs = await db.program.findMany({
    where: {
      ...(canSeeAll ? {} : { program_group_id: user.group_id || 0 }),
      program_name: { contains: query },
    },
    include: {
      program_type: true,
      program_group: true,
    },
    orderBy: { program_name: 'asc' }
  });

  const types = await db.programType.findMany();
  const groups = await db.programGroup.findMany();

  const getIcon = (typeId: number) => {
    switch (typeId) {
      case 1: return <Laptop size={20} />;
      case 2: return <Globe size={20} />;
      case 3: return <Code size={20} />;
      case 4: case 5: return <Smartphone size={20} />;
      case 6: return <DbIcon size={20} />;
      default: return <Settings size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      
      <main className="ml-64 p-8 w-full">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Master <span className="text-[#1db495]">Programs</span>
            </h1>
            <p className="text-slate-500 font-medium italic">
              {canSeeAll ? "Viewing all team programs" : `Viewing programs for ${user.program_group?.group_name}`}
            </p>
          </div>
          <CreateProgramModal user={user} types={types} groups={groups} />
        </header>

        <div className="mb-8 flex items-center gap-4">
          <SearchInput />
          {query && (
            <p className="text-sm font-bold text-slate-400">
              Found {programs.length} results for "<span className="text-[#1db495]">{query}</span>"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length > 0 ? (
            programs.map((p) => {
              const isDeleted = p.deleted_at !== null;
              const canEditDelete = isSuperAdmin || 
                                    user.role_id === 4 || 
                                    user.role_id === 5 || 
                                    (user.role_id === 3 && p.program_group_id === user.group_id);

              return (
                <div key={p.id} className={`bg-white p-6 rounded-[2.5rem] border ${isDeleted ? 'border-red-200 bg-red-50/30' : 'border-slate-100'} shadow-sm transition-all group`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${isDeleted ? 'bg-red-100 text-red-500' : 'bg-slate-50 text-[#1db495]'}`}>
                      {getIcon(p.program_type_id)}
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isDeleted ? 'bg-red-500 text-white' : 'bg-[#1db495]/10 text-[#1db495]'}`}>
                      {isDeleted ? "Inactive / Deleted" : p.program_type.program_type}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-1 ${isDeleted ? 'text-slate-400' : 'text-slate-800'}`}>
                    {p.program_name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4">
                    Team: {p.program_group.group_name}
                  </p>

                  <ProgramActions 
                    id={p.id} 
                    isDeleted={isDeleted}
                    canEditDelete={canEditDelete}
                    programData={p}     
                    user={user}          
                    types={types}        
                    groups={groups}      
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium italic">No programs found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}