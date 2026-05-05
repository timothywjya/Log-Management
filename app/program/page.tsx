import CreateProgramModal from "@/components/modal/ProgramModal";
import ProgramActions from "@/components/ProgramActions";
import SearchInput from "@/components/SearchInput";
import Sidebar from "@/components/sidebar";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveRole } from "@/lib/config/admin";
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
    where: { nik: session!.nik },
    include: { team: true, sub_team: true, program_group: true },
  });

  if (!user) redirect("/login");
  if ((user as any).must_reset_password) redirect("/reset-password");

  const role = resolveRole(user);
  const isAdmin = role === "administrator";
  const isManager = role === "manager_programmer" || role === "manager_support";
  const canSeeAll = isAdmin || isManager;
  const canEditDelete = isAdmin || isManager;

  const query = (await searchParams).query || "";

  const programs = await db.program.findMany({
    where: {
      // Admin lihat semua; Manager & Staff filter per group
      ...(canSeeAll ? {} : { program_group_id: user.group_id ?? undefined }),
      ...(query ? { program_name: { contains: query, mode: "insensitive" } } : {}),
    },
    include: { program_type: true, program_group: true, team: true },
    orderBy: { program_name: "asc" },
  });

  const types  = await db.programType.findMany();
  // Admin lihat semua group; non-admin hanya group sendiri
  const groups = isAdmin
    ? await db.programGroup.findMany({ orderBy: { group_name: "asc" } })
    : await db.programGroup.findMany({
        where: { id: user.group_id ?? undefined },
        orderBy: { group_name: "asc" },
      });

  const getIcon = (typeId: string) => {
    const icons: Record<string, React.ReactNode> = {
      desktop: <Laptop size={18} />,
      web:     <Globe size={18} />,
      api:     <Code size={18} />,
      mobile:  <Smartphone size={18} />,
      app:     <Smartphone size={18} />,
      db:      <DbIcon size={18} />,
    };
    return icons[typeId?.toLowerCase?.()] ?? <Settings size={18} />;
  };

  const roleLabel = {
    administrator:      "Semua program (Administrator)",
    manager_programmer: "Semua program (Manager Programmer)",
    manager_support:    "Semua program (Manager Support)",
    staff:              `Program ${user.program_group?.group_name ?? "grup Anda"}`,
  }[role];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />

      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Master <span className="text-[#1db495]">Program</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5 italic">{roleLabel}</p>
            </div>
            <CreateProgramModal user={user} types={types} groups={groups} />
          </div>
        </header>

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <SearchInput />
          {query && (
            <p className="text-sm font-bold text-slate-400 shrink-0">
              {programs.length} hasil untuk &ldquo;<span className="text-[#1db495]">{query}</span>&rdquo;
            </p>
          )}
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
            Total: {programs.length}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            Aktif: {programs.filter((p: any) => !p.deleted_at).length}
          </span>
          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
            Nonaktif: {programs.filter((p: any) => p.deleted_at).length}
          </span>
          {isAdmin && (
            <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              All Groups
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {programs.length > 0 ? (
            programs.map((p: any) => {
              const isDeleted = p.deleted_at !== null;
              return (
                <div
                  key={p.id}
                  className={`bg-white p-5 rounded-2xl lg:rounded-3xl border shadow-sm transition-all hover:shadow-md group
                    ${isDeleted ? "border-red-100 bg-red-50/30" : "border-slate-100"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${isDeleted ? "bg-red-100 text-red-500" : "bg-[#1db495]/10 text-[#1db495]"}`}>
                      {getIcon(p.program_type?.program_type)}
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest
                      ${isDeleted ? "bg-red-500 text-white" : "bg-[#1db495]/10 text-[#1db495]"}`}>
                      {isDeleted ? "Nonaktif" : p.program_type?.program_type}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm mb-1 leading-snug ${isDeleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {p.program_name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                    {p.program_group?.group_name}
                  </p>
                  {p.team && (
                    <p className="text-[10px] font-medium text-slate-300 mb-4">
                      Tim: {p.team.team_name}
                    </p>
                  )}

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
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <Settings size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium">
                {query ? "Tidak ada program yang cocok" : "Belum ada program"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
