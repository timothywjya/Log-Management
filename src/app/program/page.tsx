import { canManageProgram } from "@/domain/policies/permissions";
import { container } from "@/infrastructure/container";
import CreateProgramModal from "@/presentation/components/modal/ProgramModal";
import ProgramActions from "@/presentation/components/ProgramActions";
import SearchInput from "@/presentation/components/SearchInput";
import Sidebar from "@/presentation/components/sidebar";
import { requireUser } from "@/presentation/guards/auth";
import { Code, Database as DbIcon, Globe, KeyRound, Laptop, Settings, Smartphone } from "lucide-react";

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const user = await requireUser();

  const query = ((await searchParams).query || "").trim();
  const { programs, types, groups, canSeeAll } = await container.listPrograms.execute(user, query);

  // Hanya field yang dibutuhkan client component yang dikirim ke browser.
  const clientUser = { role_id: user.role_id, group_id: user.group_id };

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
          <CreateProgramModal user={clientUser} types={types} groups={groups} />
        </header>

        <div className="mb-8 flex items-center gap-4">
          <SearchInput />
          {query && (
            <p className="text-sm font-bold text-slate-400">
              Found {programs.length} results for &quot;<span className="text-[#1db495]">{query}</span>&quot;
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length > 0 ? (
            programs.map((p) => {
              const isDeleted = p.deleted_at !== null;
              const canEditDelete = canManageProgram(user, p.program_group_id);

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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3">
                    Team: {p.program_group.group_name}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-[11px]">
                    <KeyRound size={13} className={p.secret_key_prefix ? "text-[#1db495]" : "text-amber-500"} />
                    {p.secret_key_prefix ? (
                      <span className="font-mono text-slate-500">{p.secret_key_prefix}••••••••</span>
                    ) : (
                      <span className="font-bold text-amber-600">Belum ada secret key</span>
                    )}
                  </div>

                  <ProgramActions 
                    id={p.id} 
                    isDeleted={isDeleted}
                    canEditDelete={canEditDelete}
                    programData={{
                      id: p.id,
                      program_name: p.program_name,
                      program_type_id: p.program_type_id,
                      program_group_id: p.program_group_id,
                    }}
                    hasKey={!!p.secret_key_prefix}
                    user={clientUser}
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