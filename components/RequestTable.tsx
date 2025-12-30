"use client";

import { approveUser, rejectUser } from "@/app/actions/user-request";
import { UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function RequestTable({ users, roles, groups }: any) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleReject = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Reject User?",
      text: `Account for ${name || 'this user'} will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Reject",
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      await rejectUser(id);
      Swal.fire("Deleted", "User has been rejected.", "success");
    }
  };

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>, userId: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleId = Number(formData.get("roleId"));
    const groupId = Number(formData.get("groupId"));

    if (!roleId || !groupId) {
      return Swal.fire("Error", "Please select Role and Group first", "error");
    }

    setLoadingId(userId);
    await approveUser(userId, roleId, groupId);
    setLoadingId(null);
    Swal.fire({ title: "Approved!", icon: "success", timer: 1500, showConfirmButton: false });
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
        <tr>
          <th className="p-5 text-[10px] font-black uppercase tracking-widest">User Info</th>
          <th className="p-5 text-[10px] font-black uppercase tracking-widest">Assignment</th>
          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {users.length === 0 ? (
          <tr>
            <td colSpan={3} className="p-20 text-center text-slate-400 italic">No pending requests.</td>
          </tr>
        ) : (
          users.map((u: any) => {
            const isProfileComplete = u.first_name && u.user_email;

            return (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{u.first_name ? `${u.first_name} ${u.last_name}` : "Incomplete Profile"}</span>
                    <span className="text-xs text-slate-400 font-medium">{u.user_email || u.nik}</span>
                  </div>
                </td>
                
                <td className="p-5">
                  {isProfileComplete ? (
                    <form id={`form-${u.id}`} onSubmit={(e) => handleApprove(e, u.id)} className="flex gap-3">
                      <select name="roleId" required className="bg-slate-100 border-none rounded-xl text-xs font-bold p-2 focus:ring-2 focus:ring-[#1db495]">
                        <option value="">Select Position - Role</option>
                        {roles.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            {r.position_description} - {r.group_description} - {r.role_name}
                          </option>
                        ))}
                      </select>
                      <select name="groupId" required className="bg-slate-100 border-none rounded-xl text-xs font-bold p-2 focus:ring-2 focus:ring-[#1db495]">
                        <option value="">Select Group</option>
                        {groups.map((g: any) => (
                          <option key={g.id} value={g.id}>{g.group_name}</option>
                        ))}
                      </select>
                    </form>
                  ) : (
                    <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase">Waiting for User Profile</span>
                  )}
                </td>

                <td className="p-5">
                  <div className="flex items-center justify-center gap-2">
                    {isProfileComplete && (
                      <button 
                        type="submit" 
                        form={`form-${u.id}`}
                        disabled={loadingId === u.id}
                        className="p-2 bg-[#1db495] text-white rounded-lg hover:bg-[#168a73] shadow-md shadow-[#1db495]/20 disabled:opacity-50"
                        title="Approve User"
                      >
                        <UserCheck size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleReject(u.id, u.first_name)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      title="Reject & Delete"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}