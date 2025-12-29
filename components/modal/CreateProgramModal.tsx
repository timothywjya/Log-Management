"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function CreateProgramModal({ user, types, groups }: any) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isLockedToOwnGroup = user.role_id === 2 || user.role_id === 3;
  const defaultGroupId = isLockedToOwnGroup ? user.group_id : "";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#1db495] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#168a73] transition-all"
      >
        <Plus size={18} /> Create Program
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Add New <span className="text-[#1db495]">Program</span></h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Program Name</label>
                <input type="text" className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 focus:ring-2 focus:ring-[#1db495]" placeholder="e.g. My Awesome App" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Program Type</label>
                <select className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 focus:ring-2 focus:ring-[#1db495]">
                  {types.map((t: any) => <option key={t.id} value={t.id}>{t.program_type}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Team Group</label>
                <select 
                  disabled={isLockedToOwnGroup}
                  defaultValue={defaultGroupId}
                  className="w-full h-12 bg-slate-100 border-none rounded-xl px-4 mt-1 disabled:opacity-60 focus:ring-2 focus:ring-[#1db495]"
                >
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
                {isLockedToOwnGroup && <p className="text-[9px] text-amber-600 mt-1 italic font-medium ml-1">* Locked to your current group</p>}
              </div>

              <button type="submit" className="w-full h-14 bg-[#1db495] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#1db495]/30 hover:bg-[#168a73] transition-all mt-4">
                Save Program
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}