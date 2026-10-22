"use client";

import type { Program, ProgramType } from "@/domain/entities/program";
import type { ProgramGroup } from "@/domain/entities/user";
import type { AccessUser } from "@/domain/policies/permissions";
import { createProgram, updateProgram } from "@/presentation/actions/program";
import SecretKeyDialog from "@/presentation/components/SecretKeyDialog";
import { isLockedToOwnGroup } from "@/domain/policies/permissions";
import { Edit2, Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";

type Props = {
  mode?: "create" | "edit";
  program?: Pick<Program, "id" | "program_name" | "program_type_id" | "program_group_id">;
  user: AccessUser;
  types: ProgramType[];
  groups: ProgramGroup[];
};

export default function ProgramModal({ mode = "create", program, user, types, groups }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<{ programName: string; secretKey: string } | null>(null);

  const lockedGroup = isLockedToOwnGroup(user);
  const defaultGroupId = mode === "edit" ? program?.program_group_id : lockedGroup ? user.group_id ?? "" : "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: String(formData.get("name") ?? ""),
      typeId: Number(formData.get("typeId")),
      // <select disabled> tidak ikut terkirim di FormData; server juga yang menentukan group untuk role terkunci.
      groupId: lockedGroup ? undefined : Number(formData.get("groupId")),
    };

    const showError = (message: string) =>
      Swal.fire({ title: "Gagal", text: message, icon: "error", customClass: { popup: "rounded-[2.5rem]" } });

    startTransition(async () => {
      if (mode === "create") {
        const result = await createProgram(data);
        if (!result.ok) return void showError(result.error);
        setIsOpen(false);
        // Program baru langsung dibuatkan secret key; tampilkan sekali.
        setNewKey({ programName: result.programName, secretKey: result.secretKey });
      } else {
        const result = await updateProgram(program!.id, data);
        if (!result.ok) return void showError(result.error);
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      {mode === "create" ? (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-[#1db495] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#168a73] transition-all"><Plus size={18}/> Create Program</button>
      ) : (
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-400 hover:text-[#1db495] hover:bg-[#1db495]/10 rounded-lg transition-all"><Edit2 size={18}/></button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">{mode === "create" ? "Add New" : "Edit"} <span className="text-[#1db495]">Program</span></h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Program Name</label>
                <input required maxLength={255} name="name" defaultValue={program?.program_name} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 focus:ring-2 focus:ring-[#1db495]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select required name="typeId" defaultValue={program?.program_type_id} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1">
                  {types.map((t) => <option key={t.id} value={t.id}>{t.program_type}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Group</label>
                <select required name="groupId" disabled={lockedGroup} defaultValue={defaultGroupId} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 disabled:opacity-50">
                  {!lockedGroup && <option value="">Pilih group</option>}
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
              </div>
              {mode === "create" && (
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Secret key akan dibuat otomatis dan ditampilkan sekali setelah program tersimpan.
                </p>
              )}
              <button disabled={isPending} className="w-full h-14 bg-[#1db495] text-white rounded-2xl font-black shadow-lg hover:bg-[#168a73] transition-all flex justify-center items-center disabled:opacity-60">
                {isPending ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
              </button>
            </form>
          </div>
        </div>
      )}

      {newKey && <SecretKeyDialog {...newKey} onClose={() => setNewKey(null)} />}
    </>
  );
}
