"use client";

import { isAdminUser, isManagerUser, resolveRole } from "@/lib/config/admin";
import {
  createTeamAction,
  updateTeamAction,
  softDeleteTeamAction,
  restoreTeamAction,
  createSubTeamAction,
  updateSubTeamAction,
  softDeleteSubTeamAction,
  restoreSubTeamAction,
} from "@/app/actions/team";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────
interface SubTeam {
  id: string;
  sub_team_name: string;
  team_id: string;
  deleted_at: Date | null;
  deleted_by: string | null;
  created_at: Date;
  created_by: string | null;
}

interface Team {
  id: string;
  team_name: string;
  team_type: string;
  deleted_at: Date | null;
  deleted_by: string | null;
  created_at: Date;
  created_by: string | null;
  sub_teams: SubTeam[];
  _count: { users: number };
}

interface Props {
  currentUser: any;
  teams: Team[];
}

// ─── Shared classes ───────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1db495]/30 focus:border-[#1db495] transition-all placeholder:text-slate-300";
const btnPrimary =
  "flex items-center gap-2 px-4 py-2 bg-[#1db495] text-white text-sm font-bold rounded-xl hover:bg-[#18a382] transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary =
  "flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all";
const btnDanger =
  "flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50";
const btnRestore =
  "flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all disabled:opacity-50";
const btnEdit =
  "flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50";

// ═══════════════════════════════════════════════════════════════
//  MODAL: Team Form
// ═══════════════════════════════════════════════════════════════
function TeamFormModal({
  team,
  onClose,
}: {
  team?: Team;
  onClose: () => void;
}) {
  const isEdit = !!team;
  const [name, setName] = useState(team?.team_name ?? "");
  const [type, setType] = useState<"programmer" | "support">(
    (team?.team_type as any) ?? "programmer"
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!name.trim()) {
      Swal.fire({ title: "Nama tim wajib diisi", icon: "warning", customClass: { popup: "rounded-3xl" } });
      return;
    }
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateTeamAction(team!.id, { team_name: name, team_type: type });
        } else {
          await createTeamAction({ team_name: name, team_type: type });
        }
        Swal.fire({
          title: isEdit ? "Tim diperbarui!" : "Tim dibuat!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-3xl" },
        });
        onClose();
      } catch (err: any) {
        Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? "Edit Tim" : "Buat Tim Baru"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? "Perbarui informasi tim" : "Tambah tim programmer atau support"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Tim
            </label>
            <input
              className={inputCls}
              placeholder="contoh: Tim Programmer Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tipe Tim
            </label>
            <div className="flex gap-3">
              {(["programmer", "support"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all capitalize ${
                    type === t
                      ? t === "programmer"
                        ? "bg-violet-50 border-violet-400 text-violet-700"
                        : "bg-sky-50 border-sky-400 text-sky-700"
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={`flex-1 ${btnSecondary} justify-center`}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isPending} className={`flex-1 ${btnPrimary} justify-center`}>
            <Save size={15} />
            {isPending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Buat Tim"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: SubTeam Form
// ═══════════════════════════════════════════════════════════════
function SubTeamFormModal({
  subTeam,
  teams,
  defaultTeamId,
  onClose,
}: {
  subTeam?: SubTeam;
  teams: Team[];
  defaultTeamId?: string;
  onClose: () => void;
}) {
  const isEdit = !!subTeam;
  const [name, setName] = useState(subTeam?.sub_team_name ?? "");
  const [teamId, setTeamId] = useState(subTeam?.team_id ?? defaultTeamId ?? "");
  const [isPending, startTransition] = useTransition();

  // Hanya tampilkan team yang aktif (tidak dihapus) dan tipe programmer
  const availableTeams = teams.filter(
    (t) => !t.deleted_at && t.team_type === "programmer"
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      Swal.fire({ title: "Nama sub tim wajib diisi", icon: "warning", customClass: { popup: "rounded-3xl" } });
      return;
    }
    if (!teamId) {
      Swal.fire({ title: "Tim induk wajib dipilih", icon: "warning", customClass: { popup: "rounded-3xl" } });
      return;
    }
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateSubTeamAction(subTeam!.id, { sub_team_name: name, team_id: teamId });
        } else {
          await createSubTeamAction({ sub_team_name: name, team_id: teamId });
        }
        Swal.fire({
          title: isEdit ? "Sub tim diperbarui!" : "Sub tim dibuat!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-3xl" },
        });
        onClose();
      } catch (err: any) {
        Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? "Edit Sub Tim" : "Buat Sub Tim Baru"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Sub tim hanya tersedia untuk tim Programmer</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tim Induk (Programmer)
            </label>
            <select
              className={inputCls}
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              <option value="">-- Pilih Tim --</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
            {availableTeams.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">Belum ada tim programmer aktif</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Sub Tim
            </label>
            <input
              className={inputCls}
              placeholder="contoh: Frontend, Backend, Mobile"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={`flex-1 ${btnSecondary} justify-center`}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isPending} className={`flex-1 ${btnPrimary} justify-center`}>
            <Save size={15} />
            {isPending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Buat Sub Tim"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TEAM CARD
// ═══════════════════════════════════════════════════════════════
function TeamCard({
  team,
  allTeams,
  canManage,
  onEditTeam,
  onDeleteTeam,
  onRestoreTeam,
  onAddSubTeam,
  onEditSubTeam,
  onDeleteSubTeam,
  onRestoreSubTeam,
}: {
  team: Team;
  allTeams: Team[];
  canManage: boolean;
  onEditTeam: (t: Team) => void;
  onDeleteTeam: (t: Team) => void;
  onRestoreTeam: (t: Team) => void;
  onAddSubTeam: (teamId: string) => void;
  onEditSubTeam: (st: SubTeam) => void;
  onDeleteSubTeam: (st: SubTeam) => void;
  onRestoreSubTeam: (st: SubTeam) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isDeleted = !!team.deleted_at;
  const isProgrammer = team.team_type === "programmer";
  const activeSubTeams = team.sub_teams.filter((st) => !st.deleted_at);
  const deletedSubTeams = team.sub_teams.filter((st) => !!st.deleted_at);

  return (
    <div
      className={`bg-white rounded-2xl lg:rounded-3xl border shadow-sm transition-all ${
        isDeleted ? "border-red-100 opacity-60" : "border-slate-100"
      }`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 text-slate-400 hover:text-slate-600 shrink-0"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`font-black text-base leading-tight ${
                    isDeleted ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  {team.team_name}
                </h3>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    isProgrammer
                      ? "bg-violet-100 text-violet-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {team.team_type}
                </span>
                {isDeleted && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-600">
                    Nonaktif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Users size={10} />
                  {team._count.users} anggota
                </span>
                {isProgrammer && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Layers size={10} />
                    {activeSubTeams.length} sub tim aktif
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {canManage && (
            <div className="flex items-center gap-1.5 shrink-0">
              {!isDeleted ? (
                <>
                  <button onClick={() => onEditTeam(team)} className={btnEdit} title="Edit Tim">
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button onClick={() => onDeleteTeam(team)} className={btnDanger} title="Hapus Tim">
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <button onClick={() => onRestoreTeam(team)} className={btnRestore} title="Restore Tim">
                  <RotateCcw size={12} />
                  Restore
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub Teams (hanya programmer) */}
      {isProgrammer && expanded && (
        <div className="border-t border-slate-50 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sub Teams
            </p>
            {canManage && !isDeleted && (
              <button
                onClick={() => onAddSubTeam(team.id)}
                className="flex items-center gap-1 text-[10px] font-bold text-[#1db495] hover:text-[#18a382] transition-colors"
              >
                <Plus size={11} />
                Tambah Sub Tim
              </button>
            )}
          </div>

          {/* Active Sub Teams */}
          {activeSubTeams.length === 0 && deletedSubTeams.length === 0 ? (
            <p className="text-xs text-slate-300 italic">Belum ada sub tim</p>
          ) : (
            <div className="space-y-1.5">
              {activeSubTeams.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2"
                >
                  <span className="text-xs font-semibold text-slate-700">{st.sub_team_name}</span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSubTeam(st)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                        title="Edit Sub Tim"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={() => onDeleteSubTeam(st)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Sub Tim"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Deleted Sub Teams */}
              {deletedSubTeams.length > 0 && (
                <>
                  <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider mt-3 mb-1.5">
                    Nonaktif ({deletedSubTeams.length})
                  </p>
                  {deletedSubTeams.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between bg-red-50/60 rounded-xl px-3 py-2 opacity-70"
                    >
                      <span className="text-xs font-semibold text-red-400 line-through">
                        {st.sub_team_name}
                      </span>
                      {canManage && (
                        <button
                          onClick={() => onRestoreSubTeam(st)}
                          className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Restore Sub Tim"
                        >
                          <RotateCcw size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Support info */}
      {!isProgrammer && expanded && (
        <div className="border-t border-slate-50 px-5 pb-4 pt-3">
          <p className="text-[10px] text-sky-500 italic">
            Tim Support tidak memiliki sub tim
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN CLIENT
// ═══════════════════════════════════════════════════════════════
export default function TeamsClient({ currentUser, teams }: Props) {
  const role = resolveRole(currentUser);
  const canManage = role === "administrator" || role === "manager_programmer" || role === "manager_support";

  // Filter tabs
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "programmer" | "support">("all");

  // Modals
  const [teamModal, setTeamModal] = useState<{ open: boolean; team?: Team }>({ open: false });
  const [subTeamModal, setSubTeamModal] = useState<{ open: boolean; subTeam?: SubTeam; defaultTeamId?: string }>({
    open: false,
  });

  // Actions
  const [isPending, startTransition] = useTransition();

  const handleDeleteTeam = (team: Team) => {
    Swal.fire({
      title: `Nonaktifkan "${team.team_name}"?`,
      text: "Tim akan di-soft delete dan bisa direstore kapan saja.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await softDeleteTeamAction(team.id);
            Swal.fire({ title: "Tim dinonaktifkan", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
          } catch (err: any) {
            Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
          }
        });
      }
    });
  };

  const handleRestoreTeam = (team: Team) => {
    Swal.fire({
      title: `Restore "${team.team_name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1db495",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Restore",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await restoreTeamAction(team.id);
            Swal.fire({ title: "Tim diaktifkan kembali", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
          } catch (err: any) {
            Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
          }
        });
      }
    });
  };

  const handleDeleteSubTeam = (st: SubTeam) => {
    Swal.fire({
      title: `Nonaktifkan "${st.sub_team_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await softDeleteSubTeamAction(st.id);
            Swal.fire({ title: "Sub tim dinonaktifkan", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
          } catch (err: any) {
            Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
          }
        });
      }
    });
  };

  const handleRestoreSubTeam = (st: SubTeam) => {
    startTransition(async () => {
      try {
        await restoreSubTeamAction(st.id);
        Swal.fire({ title: "Sub tim diaktifkan", icon: "success", timer: 1200, showConfirmButton: false, customClass: { popup: "rounded-3xl" } });
      } catch (err: any) {
        Swal.fire({ title: "Gagal", text: err.message, icon: "error", customClass: { popup: "rounded-3xl" } });
      }
    });
  };

  // Filter teams
  const filtered = teams.filter((t) => {
    if (!showDeleted && t.deleted_at) return false;
    if (filterType !== "all" && t.team_type !== filterType) return false;
    return true;
  });

  const activeCount = teams.filter((t) => !t.deleted_at).length;
  const deletedCount = teams.filter((t) => !!t.deleted_at).length;
  const programmerCount = teams.filter((t) => !t.deleted_at && t.team_type === "programmer").length;
  const supportCount = teams.filter((t) => !t.deleted_at && t.team_type === "support").length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Tim</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola Teams dan Sub Teams organisasi
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={() => setSubTeamModal({ open: true })}
                className={btnSecondary}
                disabled={isPending}
              >
                <Plus size={15} />
                Sub Tim
              </button>
              <button
                onClick={() => setTeamModal({ open: true })}
                className={btnPrimary}
                disabled={isPending}
              >
                <Plus size={15} />
                Tim Baru
              </button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Aktif", value: activeCount, color: "text-slate-900", bg: "bg-white" },
            { label: "Programmer", value: programmerCount, color: "text-violet-700", bg: "bg-violet-50" },
            { label: "Support", value: supportCount, color: "text-sky-700", bg: "bg-sky-50" },
            { label: "Nonaktif", value: deletedCount, color: "text-red-600", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-black ${s.color} leading-none mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
          {(["all", "programmer", "support"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filterType === t
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {t === "all" ? "Semua" : t}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showDeleted
                  ? "bg-red-100 text-red-600 border border-red-200"
                  : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {showDeleted ? "Sembunyikan Nonaktif" : "Tampilkan Nonaktif"}
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Layers size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-semibold">Tidak ada tim ditemukan</p>
            <p className="text-slate-300 text-sm mt-1">Coba ubah filter atau buat tim baru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                allTeams={teams}
                canManage={canManage}
                onEditTeam={(t) => setTeamModal({ open: true, team: t })}
                onDeleteTeam={handleDeleteTeam}
                onRestoreTeam={handleRestoreTeam}
                onAddSubTeam={(teamId) => setSubTeamModal({ open: true, defaultTeamId: teamId })}
                onEditSubTeam={(st) => setSubTeamModal({ open: true, subTeam: st })}
                onDeleteSubTeam={handleDeleteSubTeam}
                onRestoreSubTeam={handleRestoreSubTeam}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {teamModal.open && (
        <TeamFormModal
          team={teamModal.team}
          onClose={() => setTeamModal({ open: false })}
        />
      )}
      {subTeamModal.open && (
        <SubTeamFormModal
          subTeam={subTeamModal.subTeam}
          teams={teams}
          defaultTeamId={subTeamModal.defaultTeamId}
          onClose={() => setSubTeamModal({ open: false })}
        />
      )}
    </div>
  );
}
