"use client";

import { resolveRole } from "@/lib/config/admin";
import { toggleUserStatus } from "@/app/actions/user-team";
import { RotateCcw, ShieldAlert, Trash2, User } from "lucide-react";
import { useTransition } from "react";
import Swal from "sweetalert2";

export default function TeamTable({
  members,
  currentUser,
  teamType,
}: {
  members: any[];
  currentUser: any;
  teamType: "programmer" | "support";
}) {
  const [isPending, startTransition] = useTransition();
  const role = resolveRole(currentUser);

  const canManage = () => {
    if (role === "administrator") return true;
    if (role === "manager_programmer" && teamType === "programmer") return true;
    if (role === "manager_support" && teamType === "support") return true;
    return false;
  };
  const hasAccess = canManage();

  const handleAction = (id: string, action: "delete" | "restore", name: string) => {
    Swal.fire({
      title: `${action === "delete" ? "Nonaktifkan" : "Aktifkan"} User?`,
      text: `Konfirmasi untuk ${name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "delete" ? "#ef4444" : "#1db495",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Proses",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    }).then((result: any) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          await toggleUserStatus(id, action, currentUser.id);
          Swal.fire({
            title: "Berhasil!",
            text: `User telah di-${action === "delete" ? "nonaktifkan" : "aktifkan"}`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: "rounded-3xl" },
          });
        });
      }
    });
  };

  if (members.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        <User size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm font-medium">Belum ada anggota</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Nama Anggota</th>
              <th className="px-5 py-3.5">Sub Tim</th>
              <th className="px-5 py-3.5">Grup</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created At</th>
              {hasAccess && <th className="px-5 py-3.5 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((m) => {
              const isDeleted = m.deleted_at !== null;
              return (
                <tr key={m.id} className={`hover:bg-slate-50/50 transition-colors ${isDeleted ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                        {m.first_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm leading-tight">
                          {m.first_name} {m.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{m.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                      {m.sub_team?.sub_team_name ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {m.program_group?.group_name ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {isDeleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-black uppercase">
                        Nonaktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full font-black uppercase">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    <div>{new Date(m.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    {m.created_by && <div className="text-[9px] text-slate-300">by {String(m.created_by).slice(0, 8)}…</div>}
                  </td>
                  {hasAccess && (
                    <td className="px-5 py-4 text-center">
                      {!isDeleted ? (
                        <button
                          onClick={() => handleAction(m.id, "delete", m.first_name)}
                          disabled={isPending}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                          title="Nonaktifkan"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(m.id, "restore", m.first_name)}
                          disabled={isPending}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-50"
                          title="Aktifkan kembali"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-slate-50">
        {members.map((m) => {
          const isDeleted = m.deleted_at !== null;
          return (
            <div key={m.id} className={`p-4 flex items-center gap-3 ${isDeleted ? "opacity-50" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600 shrink-0">
                {m.first_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-700 text-sm truncate">
                  {m.first_name} {m.last_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{m.sub_team?.sub_team_name ?? m.program_group?.group_name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isDeleted ? (
                  <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">Nonaktif</span>
                ) : (
                  <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black">Aktif</span>
                )}
                {hasAccess && (
                  !isDeleted ? (
                    <button onClick={() => handleAction(m.id, "delete", m.first_name)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button onClick={() => handleAction(m.id, "restore", m.first_name)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                      <RotateCcw size={14} />
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
