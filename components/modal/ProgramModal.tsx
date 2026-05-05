"use client";

import { createProgram, updateProgram } from "@/app/actions/program";
import { Edit2, Loader2, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";

import Swal from "sweetalert2";
import { deleteProgram, restoreProgram } from "@/app/actions/program";

const FIELD_INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '46px',
  padding: '0 16px',
  marginTop: '6px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1e293b',
  backgroundColor: '#f1f5f9',
  border: '1.5px solid #e2e8f0',
  borderRadius: '12px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProgramModal({ mode = "create", program, user, types, groups }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isLockedToOwnGroup = user.role_id === 2 || user.role_id === 3;
  const defaultGroupId =
    mode === "edit"
      ? program.program_group_id
      : isLockedToOwnGroup
      ? user.group_id
      : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      typeId: formData.get("typeId") as string,
      groupId: formData.get("groupId") as string,
    };

    startTransition(async () => {
      try {
        if (mode === "create") await createProgram(data);
        else await updateProgram(program.id, data);
        setIsOpen(false);
      } catch {
        alert("Error menyimpan data");
      }
    });
  };

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#1db495';
    e.target.style.boxShadow = '0 0 0 3px rgba(29,180,149,0.15)';
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  }

  return (
    <>
      {mode === "create" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#1db495] hover:bg-[#14866d] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-[#1db495]/25 cursor-pointer"
        >
          <Plus size={16} /> Create Program
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-[#1db495] hover:bg-[#1db495]/10 rounded-lg transition-all cursor-pointer"
        >
          <Edit2 size={16} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-200"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {mode === "create" ? "Tambah" : "Edit"}{" "}
                  <span className="text-[#1db495]">Program</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === "create" ? "Buat program baru" : "Perbarui data program"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <FormField label="Nama Program">
                <input
                  required
                  name="name"
                  defaultValue={program?.program_name}
                  placeholder="Masukkan nama program..."
                  style={{ ...FIELD_INPUT_STYLE }}
                  onFocus={focusStyle as any}
                  onBlur={blurStyle as any}
                />
              </FormField>

              <FormField label="Tipe Program">
                <select
                  name="typeId"
                  defaultValue={program?.program_type_id}
                  style={{ ...FIELD_INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={focusStyle as any}
                  onBlur={blurStyle as any}
                >
                  {types.map((t: any) => (
                    <option key={t.id} value={t.id} style={{ color: '#1e293b', backgroundColor: '#fff' }}>
                      {t.program_type}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Grup Program">
                <select
                  name="groupId"
                  disabled={isLockedToOwnGroup}
                  defaultValue={defaultGroupId}
                  style={{
                    ...FIELD_INPUT_STYLE,
                    cursor: isLockedToOwnGroup ? 'not-allowed' : 'pointer',
                    opacity: isLockedToOwnGroup ? 0.6 : 1,
                  }}
                  onFocus={focusStyle as any}
                  onBlur={blurStyle as any}
                >
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id} style={{ color: '#1e293b', backgroundColor: '#fff' }}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
                {isLockedToOwnGroup && (
                  <p className="text-[10px] text-slate-400 mt-1 ml-1 italic">
                    Terkunci ke grup Anda
                  </p>
                )}
              </FormField>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-[#1db495] hover:bg-[#14866d] text-white rounded-2xl font-black shadow-lg shadow-[#1db495]/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer text-sm"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Program"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Program Actions (Edit / Delete / Restore) ─── */
export function ProgramActions({ id, isDeleted, canEditDelete, programData, user, types, groups }: any) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Nonaktifkan Program?",
      text: `Program "${programData.program_name}" akan dinonaktifkan`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-2.5 font-bold text-sm",
        cancelButton: "rounded-xl px-6 py-2.5 font-bold text-sm",
      },
    });
    if (result.isConfirmed) {
      startTransition(async () => { await deleteProgram(id); });
    }
  }

  async function handleRestore() {
    const result = await Swal.fire({
      title: "Aktifkan Kembali?",
      text: `Program "${programData.program_name}" akan diaktifkan`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1db495",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Aktifkan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-2.5 font-bold text-sm",
        cancelButton: "rounded-xl px-6 py-2.5 font-bold text-sm",
      },
    });
    if (result.isConfirmed) {
      startTransition(async () => { await restoreProgram(id); });
    }
  }

  if (!canEditDelete) return null;

  return (
    <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
      {!isDeleted && (
        <ProgramModal
          mode="edit"
          program={programData}
          user={user}
          types={types}
          groups={groups}
        />
      )}
      {isDeleted ? (
        <button
          onClick={handleRestore}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw size={13} /> Aktifkan
        </button>
      ) : (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 size={13} /> Nonaktifkan
        </button>
      )}
    </div>
  );
}
