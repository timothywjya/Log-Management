import Sidebar from "@/components/sidebar";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  Database,
  FileText,
  User as UserIcon,
  Users
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    include: { role: true, program_group: true }
  });

  if (!user) redirect("/login");

  const isAdmin = user.role_id === 1 || user.group_id === 6;
  const isSuperUser = user.role_id === 4 || user.role_id === 5;
  const canSeeAll = isAdmin || isSuperUser;
  
  const accessFilter = canSeeAll ? {} : { program_group_id: user.group_id || 0 };

  const [totalLogs, totalUsers, allPrograms] = await Promise.all([
    10, 
    db.user.count({ where: canSeeAll ? {} : { group_id: user.group_id } }),
    db.program.findMany({ where: accessFilter })
  ]);

  const activePrograms = allPrograms.filter(p => p.deleted_at === null).length;
  const inactivePrograms = allPrograms.filter(p => p.deleted_at !== null).length;
  const totalPrograms = allPrograms.length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      
      <main className="ml-64 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium italic">Welcome back, {user?.first_name}!</p>
        </header>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Logs" 
            value={totalLogs.toLocaleString()} 
            icon={<Database className="text-blue-500"/>} 
            trend="+12% from last week" 
          />
          
          {/* CARD PROGRAMS DENGAN BREAKDOWN ACTIVE/INACTIVE */}
          <StatCard 
            title="Programs" 
            value={totalPrograms.toString()} 
            icon={<FileText className="text-emerald-500"/>} 
            activeCount={activePrograms}
            inactiveCount={inactivePrograms}
            isProgramCard={true}
          />
          
          {isAdmin && (
            <>
              <StatCard 
                title="Total Users" 
                value={totalUsers.toString()} 
                icon={<Users className="text-[#1db495]"/>} 
                trend="Across all groups" 
              />
              <StatCard 
                title="Pending Requests" 
                value="5" 
                icon={<UserIcon className="text-amber-500"/>} 
                trend="Require approval" 
                color="bg-amber-50 border-amber-100" 
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Recent Activity Log</h3>
                <button className="text-xs font-bold text-[#1db495] hover:underline">View All</button>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-sm">
                    Data tabel log akan muncul di sini via query...
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-6">Profile Snapshot</h3>
             <div className="text-center py-4">
                <div className="w-20 h-20 bg-[#1db495]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#1db495]/20">
                   <UserIcon size={32} className="text-[#1db495]" />
                </div>
                <h4 className="font-bold text-slate-900">{user?.first_name} {user?.last_name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role?.role_name}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-50 text-left space-y-3">
                   <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">NIK</span>
                      <span className="text-slate-900 font-mono">{user?.nik}</span>
                   </div>
                   <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">Team Group</span>
                      <span className="text-slate-900 font-bold">{user?.program_group?.group_name}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = "bg-white border-slate-100",
  activeCount,
  inactiveCount,
  isProgramCard = false 
}: any) {
  return (
    <div className={`p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white shadow-sm rounded-xl border border-slate-50">{icon}</div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-tighter">Live</span>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{value}</h3>
        
        {isProgramCard ? (
          <div className="flex gap-3 mt-2 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1db495]"></div>
              <p className="text-[10px] font-black text-slate-700">
                {activeCount} <span className="font-medium text-slate-400 italic">Active</span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <p className="text-[10px] font-black text-slate-700">
                {inactiveCount} <span className="font-medium text-slate-400 italic">Inactive</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-medium italic">{trend}</p>
        )}
      </div>
    </div>
  );
}