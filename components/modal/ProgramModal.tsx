"use client";

import { createProgram, updateProgram } from "@/app/actions/program";
import { Edit2, Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";

import { Trash2, Edit3, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import { deleteProgram, restoreProgram } from "@/app/actions/program";  

export default function ProgramModal({ mode = "create", program, user, types, groups }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isLockedToOwnGroup = user.role_id === 2 || user.role_id === 3;
  const defaultGroupId = mode === "edit" ? program.program_group_id : (isLockedToOwnGroup ? user.group_id : "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      typeId: Number(formData.get("typeId")),
      groupId: Number(formData.get("groupId")),
    };

    startTransition(async () => {
      try {
        if (mode === "create") await createProgram(data);
        else await updateProgram(program.id, data);
        setIsOpen(false);
      } catch (err) { alert("Error saving data"); }
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
                <input required name="name" defaultValue={program?.program_name} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 focus:ring-2 focus:ring-[#1db495]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select name="typeId" defaultValue={program?.program_type_id} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1">
                  {types.map((t: any) => <option key={t.id} value={t.id}>{t.program_type}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Group</label>
                <select name="groupId" disabled={isLockedToOwnGroup} defaultValue={defaultGroupId} className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 disabled:opacity-50">
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
              </div>
              <button disabled={isPending} className="w-full h-14 bg-[#1db495] text-white rounded-2xl font-black shadow-lg hover:bg-[#168a73] transition-all flex justify-center items-center">
                {isPending ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
