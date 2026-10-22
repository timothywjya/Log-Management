"use client";

import type { UserWithAccess } from "@/domain/entities/user";
import { canManageTeamMember } from "@/domain/policies/permissions";
import { toggleUserStatus } from "@/presentation/actions/user-team";
import { RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import { useTransition } from "react";
import Swal from "sweetalert2";

type Props = { members: UserWithAccess[]; currentUser: UserWithAccess; groupLevel: number };

export default function TeamTable({ members, currentUser, groupLevel }: Props) {
  const [isPending, startTransition] = useTransition();

  // Aturan yang sama dengan yang dicek ulang di server (domain/policies/permissions.ts).
  const canManage = (member: UserWithAccess) =>
    member.id !== currentUser.id && canManageTeamMember(currentUser, member.role?.group_level ?? groupLevel);

  const handleAction = (id: number, action: 'delete' | 'restore', name: string) => {
    Swal.fire({
      title: `${action === 'delete' ? 'Hapus' : 'Restore'} User?`,
      text: `Konfirmasi untuk user ${name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === 'delete' ? "#ef4444" : "#1db495",
      confirmButtonText: "Ya, Proses",
      customClass: { popup: 'rounded-[2.5rem]' }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await toggleUserStatus(id, action);
          if (!res.ok) {
            Swal.fire("Gagal", res.error, "error");
            return;
          }
          Swal.fire("Berhasil", `User telah di-${action}`, "success");
        });
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <tr>
            <th className="p-5">Member Name</th>
            <th className="p-5">Role / Position</th>
            <th className="p-5">Group</th>
            <th className="p-5">Status</th>
            <th className="p-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((m) => {
            const isDeleted = m.deleted_at !== null;
            const hasAccess = canManage(m);

            return (
              <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${isDeleted ? 'opacity-50' : ''}`}>
                <td className="p-5 font-bold text-slate-700">
                  {m.first_name} {m.last_name}
                  <p className="text-[10px] font-medium text-slate-400">{m.user_email}</p>
                </td>
                <td className="p-5 text-xs text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded-lg font-bold">
                    {m.role?.role_name ?? "-"}
                  </span>
                </td>
                <td className="p-5 text-xs font-bold text-slate-500">{m.program_group?.group_name}</td>
                <td className="p-5">
                  {isDeleted ? (
                    <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase">Inactive</span>
                  ) : (
                    <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                  )}
                </td>
                <td className="p-5 text-center">
                  {hasAccess ? (
                    <div className="flex justify-center gap-2">
                      {!isDeleted ? (
                        <button 
                          disabled={isPending}
                          onClick={() => handleAction(m.id, 'delete', m.first_name ?? m.nik)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button 
                          disabled={isPending}
                          onClick={() => handleAction(m.id, 'restore', m.first_name ?? m.nik)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300"><ShieldAlert size={18} className="mx-auto" /></span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}