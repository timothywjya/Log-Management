"use client";

import { approveUser, rejectUser } from "@/app/actions/user-request";
import { CheckCircle, Clock, Sparkles, User, UserCheck, UserX, XCircle } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

/** Cek apakah user "baru" (daftar dalam 24 jam terakhir) */
function isNewUser(createdAt: string | Date) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 24 * 60 * 60 * 1000; // < 24 jam
}

export default function RequestTable({
  users,
  teams,
  groups,
}: {
  users: any[];
  teams: any[];
  groups: any[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>({});

  const handleReject = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Tolak User?",
      text: `Akun ${name || "ini"} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    });
    if (result.isConfirmed) {
      await rejectUser(id);
      Swal.fire({ title: "Ditolak", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
    }
  };

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>, userId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamId    = formData.get("teamId")    as string;
    const groupId   = formData.get("groupId")   as string;
    const subTeamId = formData.get("subTeamId") as string;

    if (!teamId || !groupId) {
      return Swal.fire({ title: "Error", text: "Pilih Tim dan Grup terlebih dahulu", icon: "error", customClass: { popup: "rounded-3xl" } });
    }
    setLoadingId(userId);
    await approveUser(userId, teamId, groupId, subTeamId || undefined);
    setLoadingId(null);
    Swal.fire({ title: "Disetujui!", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
  };

  if (users.length === 0) {
    return (
      <div className="py-20 text-center">
        <CheckCircle size={40} className="mx-auto text-emerald-200 mb-3" />
        <p className="text-slate-400 font-medium">Tidak ada permintaan pending</p>
        <p className="text-slate-300 text-sm mt-1">Semua sudah diproses!</p>
      </div>
    );
  }

  const selectStyle = {
    fontSize: "12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    padding: "6px 10px",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    outline: "none",
    minWidth: "120px",
    cursor: "pointer",
  } as React.CSSProperties;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Informasi User", "Kontak", "Daftar Sejak", "Assignment", "Aksi"].map((h) => (
                <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => {
              const isNew = isNewUser(u.created_at);
              const selectedTeamId = selectedTeams[u.id] ?? "";
              const selectedTeam = teams.find((t: any) => t.id === selectedTeamId);
              const subTeams = selectedTeam?.sub_teams ?? [];
              const isSupport = (selectedTeam?.team_type ?? "").toLowerCase() === "support";

              return (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-sm font-black text-amber-600 shrink-0">
                        {u.first_name?.[0]?.toUpperCase() ?? <User size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-800 text-sm leading-tight">
                            {u.first_name ? `${u.first_name} ${u.last_name ?? ""}` : "—"}
                          </p>
                          {isNew && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Sparkles size={8} /> NEW
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-slate-400">{u.nik}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{u.user_email ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={12} className="text-amber-400" />
                      {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <form onSubmit={(e: any) => handleApprove(e, u.id)} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* Tim */}
                        <select
                          name="teamId"
                          style={selectStyle}
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeams((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        >
                          <option value="">— Tim —</option>
                          {teams.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.team_name}</option>
                          ))}
                        </select>

                        {/* Grup */}
                        <select name="groupId" style={selectStyle}>
                          <option value="">— Grup —</option>
                          {groups.map((g: any) => (
                            <option key={g.id} value={g.id}>{g.group_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sub Team: muncul hanya jika tim yang dipilih punya sub_teams dan bukan support */}
                      {!isSupport && subTeams.length > 0 && (
                        <select name="subTeamId" style={selectStyle} className="w-full">
                          <option value="">— Sub Tim (Opsional) —</option>
                          {subTeams.map((st: any) => (
                            <option key={st.id} value={st.id}>{st.sub_team_name}</option>
                          ))}
                        </select>
                      )}

                      {/* Jika support, sub_team null otomatis */}
                      {isSupport && <input type="hidden" name="subTeamId" value="" />}

                      <button
                        type="submit"
                        disabled={loadingId === u.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#1db495] text-white text-xs font-bold rounded-xl hover:bg-[#19a382] transition-colors disabled:opacity-50 whitespace-nowrap self-start"
                      >
                        <UserCheck size={13} />
                        Setujui
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleReject(u.id, u.first_name)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      title="Tolak"
                    >
                      <UserX size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-50">
        {users.map((u) => {
          const isNew = isNewUser(u.created_at);
          const selectedTeamId = selectedTeams[u.id] ?? "";
          const selectedTeam = teams.find((t: any) => t.id === selectedTeamId);
          const subTeams = selectedTeam?.sub_teams ?? [];
          const isSupport = (selectedTeam?.team_type ?? "").toLowerCase() === "support";

          return (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-black text-amber-600 shrink-0">
                  {u.first_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800 text-sm">{u.first_name ? `${u.first_name} ${u.last_name ?? ""}` : "—"}</p>
                    {isNew && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        <Sparkles size={8} /> NEW
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{u.nik} • {u.user_email}</p>
                </div>
              </div>
              <form onSubmit={(e: any) => handleApprove(e, u.id)} className="space-y-2">
                <select
                  name="teamId"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeams((prev) => ({ ...prev, [u.id]: e.target.value }))}
                >
                  <option value="">— Pilih Tim —</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
                <select name="groupId" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white">
                  <option value="">— Pilih Grup —</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
                {!isSupport && subTeams.length > 0 && (
                  <select name="subTeamId" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white">
                    <option value="">— Sub Tim (Opsional) —</option>
                    {subTeams.map((st: any) => <option key={st.id} value={st.id}>{st.sub_team_name}</option>)}
                  </select>
                )}
                {isSupport && <input type="hidden" name="subTeamId" value="" />}
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1db495] text-white text-sm font-bold rounded-xl">
                    <UserCheck size={14} /> Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(u.id, u.first_name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100"
                  >
                    <XCircle size={14} /> Tolak
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}
