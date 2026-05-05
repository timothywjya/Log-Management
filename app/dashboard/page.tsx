import Sidebar from "@/components/sidebar";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveRole } from "@/lib/config/admin";
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  User as UserIcon,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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
  const isMgrProgrammer = role === "manager_programmer";
  const isMgrSupport = role === "manager_support";
  const isManager = isMgrProgrammer || isMgrSupport;

  // Admin lihat semua program; yang lain filter per group
  const programFilter = isAdmin ? {} : user.group_id ? { program_group_id: user.group_id } : {};

  const [totalUsers, allPrograms, pendingUsers] = await Promise.all([
    db.user.count({
      where: isAdmin
        ? { deleted_at: null }
        : { group_id: user.group_id ?? undefined, deleted_at: null },
    }),
    db.program.findMany({ where: programFilter }),
    isAdmin ? db.user.count({ where: { is_guest: true, deleted_at: null } }) : Promise.resolve(0),
  ]);

  const activePrograms = allPrograms.filter((p: any) => p.deleted_at === null).length;
  const inactivePrograms = allPrograms.filter((p: any) => p.deleted_at !== null).length;

  const roleLabel = {
    administrator:      "Administrator",
    manager_programmer: "Manager Programmer",
    manager_support:    "Manager Support",
    staff:              user.program_group?.group_name ?? "Staff",
  }[role];

  const roleBadgeColor = {
    administrator:      "bg-red-100 text-red-700 border-red-200",
    manager_programmer: "bg-violet-100 text-violet-700 border-violet-200",
    manager_support:    "bg-sky-100 text-sky-700 border-sky-200",
    staff:              "bg-emerald-100 text-emerald-700 border-emerald-200",
  }[role];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />

      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                Selamat datang,{" "}
                <span className="font-bold text-slate-700">{user?.first_name}</span>!
              </p>
            </div>
            <span
              className={`self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${roleBadgeColor}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {roleLabel}
            </span>
          </div>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatCard
            title="Total Programs"
            value={allPrograms.length}
            icon={<FileText size={18} className="text-[#1db495]" />}
            detail={
              <div className="flex gap-3 mt-2 pt-2 border-t border-slate-50">
                <Badge dot="bg-[#1db495]" label={`${activePrograms} Aktif`} />
                <Badge dot="bg-red-400" label={`${inactivePrograms} Nonaktif`} />
              </div>
            }
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<Users size={18} className="text-violet-500" />}
          />
          {isAdmin && (
            <StatCard
              title="Pending Approval"
              value={pendingUsers}
              icon={<UserIcon size={18} className="text-amber-500" />}
            />
          )}
          <StatCard
            title={isAdmin ? "Semua Group" : "Group Anda"}
            value={isAdmin ? "All" : (user.program_group?.group_name ?? "—")}
            icon={<Database size={18} className="text-sky-500" />}
            isText
          />
        </div>

        {/* Info section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Profil */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#1db495]/10 rounded-xl">
                <UserIcon size={16} className="text-[#1db495]" />
              </div>
              <h2 className="font-black text-slate-900 text-sm">Informasi Akun</h2>
            </div>
            <dl className="space-y-3">
              {[
                { label: "NIK",      value: user.nik },
                { label: "Nama",     value: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—" },
                { label: "Email",    value: user.user_email ?? "—" },
                { label: "Tim",      value: user.team?.team_name ?? (isAdmin ? "All Teams" : "—") },
                { label: "Sub Tim",  value: user.sub_team?.sub_team_name ?? (isAdmin ? "All" : "—") },
                { label: "Grup",     value: user.program_group?.group_name ?? (isAdmin ? "All Groups" : "—") },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-slate-400 font-medium">{label}</dt>
                  <dd className="font-bold text-slate-700 text-right max-w-[55%] truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-violet-100 rounded-xl">
                <Activity size={16} className="text-violet-600" />
              </div>
              <h2 className="font-black text-slate-900 text-sm">Akses Cepat</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Master Program", href: "/program",   desc: isAdmin ? "Lihat semua program" : "Program grup Anda", icon: <FileText size={14} className="text-[#1db495]" /> },
                { label: "Reporting",      href: "/reporting", desc: "Laporan log aktivitas",                               icon: <BarChart3 size={14} className="text-blue-500" /> },
                ...(isAdmin ? [
                  { label: "Admin Panel",     href: "/admin",                   desc: "Kelola users & sistem",    icon: <Database size={14} className="text-red-500" /> },
                  { label: "Request Member",  href: "/users/request-member",    desc: "Approval anggota baru",    icon: <Users size={14} className="text-amber-500" /> },
                ] : (role !== "staff" ? [
                  { label: "Tim Programmer",  href: "/users/team-programmer",   desc: "Anggota tim programmer",   icon: <Users size={14} className="text-violet-500" /> },
                  { label: "Tim Support",     href: "/users/team-support",      desc: "Anggota tim support",      icon: <Users size={14} className="text-sky-500" /> },
                ] : [])),
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────
function StatCard({
  title, value, icon, detail, isText,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  detail?: React.ReactNode;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      </div>
      <p className={`font-black text-slate-900 ${isText ? "text-base" : "text-2xl lg:text-3xl"}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400 font-semibold mt-0.5">{title}</p>
      {detail}
    </div>
  );
}

function Badge({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
