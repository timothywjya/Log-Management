"use client";

import {
  deleteUserAction,
  approveUserAction,
  updateUserSettingsAction,
  setMustResetPassword,
  assignGroupTeamsAction,
} from "@/app/actions/admin";
import {
  Activity,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Clock,
  Database,
  Edit2,
  FileText,
  KeyRound,
  LayoutDashboard,
  RefreshCw,
  Save,
  Search,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  currentUser: any;
  stats: {
    totalUsers: number;
    guestUsers: number;
    totalPrograms: number;
    activePrograms: number;
    inactivePrograms: number;
    totalTeams: number;
    totalGroups: number;
  };
  teams: any[];
  subTeams: any[];
  programGroups: any[];
  allUsers: any[];
  recentLogs: any[];
}

type Tab = "overview" | "users" | "teams" | "groups";

/** Cek apakah user "baru" (daftar dalam 24 jam terakhir) */
function isNewUser(createdAt: string | Date) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

// ─── User Settings Modal ──────────────────────────────────────
function UserSettingsModal({
  user,
  teams,
  subTeams,
  groups,
  onClose,
}: {
  user: any;
  teams: any[];
  subTeams: any[];
  groups: any[];
  onClose: () => void;
}) {
  const [teamId,   setTeamId]   = useState(user.team_id    ?? "");
  const [subTeamId,setSubTeamId]= useState(user.sub_team_id ?? "");
  const [groupId,  setGroupId]  = useState(user.group_id   ?? "");
  const [isAdmin,  setIsAdmin]  = useState(user.is_admin   ?? false);
  const [isManager,setIsManager]= useState(user.is_manager ?? false);
  const [mustReset,setMustReset]= useState(user.must_reset_password ?? false);
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  const selectedTeam = teams.find((t) => t.id === teamId);
  const isSupport = (selectedTeam?.team_type ?? "").toLowerCase() === "support";
  const filteredSubTeams = subTeams.filter((st) => st.team_id === teamId);

  const handleSave = async () => {
    setLoading(true);
    await updateUserSettingsAction(user.id, {
      team_id:             teamId   || null,
      sub_team_id:         isSupport ? null : (subTeamId || null),
      group_id:            groupId  || null,
      is_admin:            isAdmin,
      is_manager:          isManager,
      must_reset_password: mustReset,
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const selectCls = "w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:border-[#1db495]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600">
              {user.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 font-mono">{user.nik}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Tim */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tim</label>
            <select className={selectCls} value={teamId} onChange={(e) => { setTeamId(e.target.value); setSubTeamId(""); }}>
              <option value="">— Pilih Tim —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name} ({t.team_type})</option>)}
            </select>
          </div>

          {/* Sub Tim (hanya jika Programmer dan ada sub teams) */}
          {!isSupport && filteredSubTeams.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sub Tim</label>
              <select className={selectCls} value={subTeamId} onChange={(e) => setSubTeamId(e.target.value)}>
                <option value="">— Tidak ada Sub Tim —</option>
                {filteredSubTeams.map((st) => <option key={st.id} value={st.id}>{st.sub_team_name}</option>)}
              </select>
            </div>
          )}
          {isSupport && (
            <p className="text-[10px] text-slate-400 italic px-1">Tim Support: Sub Tim otomatis null</p>
          )}

          {/* Grup */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Grup / Program Group</label>
            <select className={selectCls} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">— Pilih Grup —</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
            </select>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded" />
              <div>
                <p className="text-[10px] font-bold text-slate-700">Admin</p>
                <p className="text-[9px] text-slate-400">Akses penuh</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
              <input type="checkbox" checked={isManager} onChange={(e) => setIsManager(e.target.checked)}
                className="w-4 h-4 accent-violet-500 rounded" />
              <div>
                <p className="text-[10px] font-bold text-slate-700">Manager</p>
                <p className="text-[9px] text-slate-400">Akses tim</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-all">
              <input type="checkbox" checked={mustReset} onChange={(e) => setMustReset(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded" />
              <div>
                <p className="text-[10px] font-bold text-amber-700">Reset PW</p>
                <p className="text-[9px] text-amber-500">Paksa reset</p>
              </div>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saved}
            className="w-full h-11 bg-[#1db495] hover:bg-[#19a382] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</> :
             saved   ? <><CheckCircle size={14} /> Tersimpan!</> :
                       <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminDashboardClient({
  currentUser, stats, teams, subTeams, programGroups, allUsers, recentLogs,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.nik?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Hapus permanen user ini?")) return;
    setLoadingId(userId);
    try { await deleteUserAction(userId, currentUser.id); } finally { setLoadingId(null); }
  };

  const handleApprove = async (userId: string) => {
    setLoadingId(userId);
    try { await approveUserAction(userId, currentUser.id); } finally { setLoadingId(null); }
  };

  const navItems = [
    { tab: "overview" as Tab, label: "Overview",  icon: <LayoutDashboard size={15} /> },
    { tab: "users"    as Tab, label: "Users",     icon: <Users size={15} /> },
    { tab: "teams"    as Tab, label: "Teams",     icon: <Database size={15} /> },
    { tab: "groups"   as Tab, label: "Groups",    icon: <FileText size={15} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0f172a] text-white fixed left-0 top-0 h-screen z-50 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shadow shadow-red-500/30 shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-tight">Admin Panel</h1>
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Panel</p>
          {navItems.map(({ tab, label, icon }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${activeTab === tab ? "bg-red-500 text-white shadow shadow-red-500/30" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}>
              {icon} {label}
            </button>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigasi</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all">
              <BarChart3 size={15} /> Dashboard
            </Link>
            <Link href="/reporting" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all">
              <Activity size={15} /> Reporting
            </Link>
            <Link href="/users/request-member" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all">
              <UserCog size={15} /> Request Member
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={13} className="text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.first_name} {currentUser.last_name}</p>
              <p className="text-[9px] text-red-400 font-bold uppercase">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-sm font-black text-white">Admin Panel</span>
        </div>
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-2 text-slate-400 hover:text-white transition-colors">
          {mobileNavOpen ? <X size={20} /> : <ChevronRight size={20} className="rotate-90" />}
        </button>
      </div>
      {mobileNavOpen && (
        <div className="lg:hidden fixed top-[57px] left-0 right-0 z-40 bg-[#0f172a] border-b border-slate-800 p-3 flex gap-2 flex-wrap">
          {navItems.map(({ tab, label, icon }) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setMobileNavOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all
                ${activeTab === tab ? "bg-red-500 text-white" : "text-slate-400 bg-slate-800 hover:text-white"}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-60 flex-1 p-4 sm:p-6 pt-20 lg:pt-6 min-w-0">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Overview</h1>
              <p className="text-slate-500 text-sm mt-0.5">Ringkasan sistem Log Management</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Users",    value: stats.totalUsers,    color: "text-blue-600",    bg: "bg-blue-50",    icon: <Users size={18} className="text-blue-500" /> },
                { label: "Pending",        value: stats.guestUsers,    color: "text-amber-600",   bg: "bg-amber-50",   icon: <Clock size={18} className="text-amber-500" /> },
                { label: "Programs",       value: stats.totalPrograms, color: "text-[#1db495]",   bg: "bg-emerald-50", icon: <FileText size={18} className="text-[#1db495]" /> },
                { label: "Teams",          value: stats.totalTeams,    color: "text-violet-600",  bg: "bg-violet-50",  icon: <Database size={18} className="text-violet-500" /> },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent logs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-black text-slate-900 mb-4">Log Terbaru (API)</h2>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada log</p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl text-xs">
                      <Activity size={12} className="text-[#1db495] shrink-0" />
                      <span className="text-slate-600 truncate">{log.endpoint ?? log.id.slice(0, 12)}</span>
                      <span className="ml-auto text-slate-400 shrink-0 font-mono">
                        {new Date(log.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Users</h1>
                <p className="text-slate-500 text-sm mt-0.5">{allUsers.length} user terdaftar</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Cari user..."
                  value={searchQuery}
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "36px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px", fontSize: "14px", color: "#1e293b", backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", width: "100%", outline: "none" }}
                  className="w-full sm:w-64"
                />
              </div>
            </div>

            {/* Desktop table */}
            <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm hidden sm:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["User", "NIK", "Tim / Sub Tim", "Grup", "Status", "Flags", "Created At", "Aksi"].map((h) => (
                        <th key={h} className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => {
                      const isNew = isNewUser(user.created_at);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0
                                ${user.is_admin ? "bg-red-100 text-red-600" : user.is_manager ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-600"}`}>
                                {user.first_name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-bold text-slate-800">{user.first_name} {user.last_name}</p>
                                  {isNew && (
                                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                                      <Sparkles size={7} /> NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.user_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{user.nik}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            <div>{user.team?.team_name ?? "—"}</div>
                            {user.sub_team && <div className="text-[10px] text-slate-400">{user.sub_team.sub_team_name}</div>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{user.program_group?.group_name ?? "—"}</td>
                          <td className="px-4 py-3">
                            {user.is_guest ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                                <Clock size={9} /> Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                <CheckCircle size={9} /> Aktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.is_admin    && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Admin</span>}
                              {user.is_manager  && <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">Manager</span>}
                              {user.must_reset_password && (
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
                                  <KeyRound size={8} /> Reset
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                            <div>{new Date(user.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</div>
                            {user.created_by && <div className="text-[9px] text-slate-300">by {user.created_by.slice(0, 8)}…</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {user.is_guest && (
                                <button onClick={() => handleApprove(user.id)} disabled={loadingId === user.id}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                  {loadingId === user.id ? <RefreshCw size={10} className="animate-spin" /> : <UserCheck size={10} />} Approve
                                </button>
                              )}
                              <button onClick={() => setEditingUser(user)}
                                className="p-2 text-violet-400 hover:bg-violet-50 rounded-xl transition-all" title="Edit Settings">
                                <Edit2 size={14} />
                              </button>
                              {!user.is_admin && user.id !== currentUser.id && (
                                <button onClick={() => handleDeleteUser(user.id)} disabled={loadingId === user.id}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                                  {loadingId === user.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <UserX size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">Tidak ada user ditemukan</p>
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filteredUsers.map((user) => {
                const isNew = isNewUser(user.created_at);
                return (
                  <div key={user.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0
                        ${user.is_admin ? "bg-red-100 text-red-600" : user.is_manager ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-600"}`}>
                        {user.first_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{user.first_name} {user.last_name}</p>
                          {isNew && <span className="inline-flex items-center gap-0.5 text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0"><Sparkles size={7} /> NEW</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{user.nik} • {user.team?.team_name ?? "—"}</p>
                        {user.is_guest && <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pending</span>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditingUser(user)} className="p-2 bg-violet-50 text-violet-500 rounded-xl">
                          <Edit2 size={14} />
                        </button>
                        {user.is_guest && (
                          <button onClick={() => handleApprove(user.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <UserCheck size={14} />
                          </button>
                        )}
                        {!user.is_admin && user.id !== currentUser.id && (
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-50 text-red-400 rounded-xl">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEAMS */}
        {activeTab === "teams" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Teams</h1>
              <p className="text-slate-500 text-sm mt-0.5">Tim Programmer dan Support</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => {
                // Cari groups yang pakai tim ini (via programmer_team_id atau support_team_id)
                const linkedGroups = programGroups.filter(
                  (g) => g.programmer_team_id === team.id || g.support_team_id === team.id
                );
                return (
                  <div key={team.id} className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900">{team.team_name}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase
                            ${team.team_type === "support" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"}`}>
                            {team.team_type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {team.id.slice(0, 8)}…</p>
                      </div>
                      <span className="text-3xl font-black text-slate-100 leading-none">{team._count.users}</span>
                    </div>
                    <p className="text-sm text-slate-500">{team._count.users} anggota terdaftar</p>
                    {team.sub_teams?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sub Teams</p>
                        <div className="flex flex-wrap gap-1.5">
                          {team.sub_teams.map((st: any) => (
                            <span key={st.id} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                              {st.sub_team_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {team.team_type === "support" && team.sub_teams?.length === 0 && (
                      <p className="mt-2 text-[10px] text-sky-500 italic">Support team — sub tim null (otomatis)</p>
                    )}
                    {linkedGroups.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Program Groups</p>
                        <div className="flex flex-wrap gap-1.5">
                          {linkedGroups.map((g) => (
                            <span key={g.id} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                              {g.group_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GROUPS */}
        {activeTab === "groups" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Program Groups</h1>
              <p className="text-slate-500 text-sm mt-0.5">Setiap grup memiliki Tim Programmer & Tim Support</p>
            </div>
            <div className="space-y-4">
              {programGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-slate-900">{group.group_name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {group.id.slice(0, 8)}…</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-100 leading-none">{group._count.programs}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">programs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${group.programmer_team ? "bg-violet-50 border border-violet-100" : "bg-slate-50 border border-dashed border-slate-200"}`}>
                      <p className="text-[9px] font-black text-violet-700 uppercase tracking-wider mb-1">💻 Tim Programmer</p>
                      <p className="text-sm font-bold text-slate-800">{group.programmer_team?.team_name ?? "Belum di-assign"}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${group.support_team ? "bg-sky-50 border border-sky-100" : "bg-slate-50 border border-dashed border-slate-200"}`}>
                      <p className="text-[9px] font-black text-sky-700 uppercase tracking-wider mb-1">🛠 Tim Support</p>
                      <p className="text-sm font-bold text-slate-800">{group.support_team?.team_name ?? "Belum di-assign"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                    <span>{group._count.programs} programs</span>
                    <span>•</span>
                    <span>{group._count.users} users</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Settings Modal */}
      {editingUser && (
        <UserSettingsModal
          user={editingUser}
          teams={teams}
          subTeams={subTeams}
          groups={programGroups}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
