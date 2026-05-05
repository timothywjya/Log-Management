"use client";

import { deleteProgram, restoreProgram } from "@/app/actions/program";
import { Check, Copy, Eye, EyeOff, KeyRound, RotateCcw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";
import ProgramModal from "./modal/ProgramModal";

// ─── Secret Row ───────────────────────────────────────────────
function SecretRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const display = value ?? "—";
  const masked = value ? "•".repeat(Math.min(value.length, 24)) : "—";

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2">
      <div className="shrink-0 text-slate-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p
          className="text-[10px] font-mono font-semibold text-slate-700 truncate mt-0.5 select-all"
          title={value ?? ""}
        >
          {visible ? display : masked}
        </p>
      </div>
      <button
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 p-1 text-slate-300 hover:text-slate-500 rounded-lg transition-all"
        title={visible ? "Sembunyikan" : "Tampilkan"}
      >
        {visible ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      <button
        onClick={handleCopy}
        className={`shrink-0 p-1 rounded-lg transition-all ${
          copied ? "text-emerald-500" : "text-slate-300 hover:text-[#1db495]"
        }`}
        title={copied ? "Tersalin!" : "Salin"}
        disabled={!value}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ProgramActions({
  id,
  isDeleted,
  canEditDelete,
  programData,
  user,
  types,
  groups,
}: any) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    Swal.fire({
      title: "Nonaktifkan Program?",
      text: `"${programData.program_name}" akan dipindahkan ke arsip`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Nonaktifkan",
      cancelButtonColor: "#64748b",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-[2.5rem]",
        confirmButton: "rounded-xl px-6 py-3 font-bold",
        cancelButton: "rounded-xl px-6 py-3 font-bold",
      },
    }).then((result: any) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await deleteProgram(id);
            Swal.fire({ title: "Dinonaktifkan!", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-[2.5rem]" } });
          } catch (error: any) {
            Swal.fire("Error", error.message ?? "Gagal menonaktifkan program", "error");
          }
        });
      }
    });
  };

  const handleRestore = () => {
    Swal.fire({
      title: "Aktifkan Kembali?",
      text: `"${programData.program_name}" akan diaktifkan kembali`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1db495",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Aktifkan",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-[2.5rem]",
        confirmButton: "rounded-xl px-6 py-3 font-bold",
        cancelButton: "rounded-xl px-6 py-3 font-bold",
      },
    }).then((result: any) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await restoreProgram(id);
            Swal.fire({ title: "Diaktifkan!", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-[2.5rem]" } });
          } catch (error: any) {
            Swal.fire("Error", error.message ?? "Gagal mengaktifkan program", "error");
          }
        });
      }
    });
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-50">
      {/* Secret Key & IV — semua user bisa lihat & copy */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          <KeyRound size={10} className="text-slate-400" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credentials</p>
        </div>
        <SecretRow
          label="Secret Key"
          value={programData.secret_key}
          icon={<KeyRound size={10} />}
        />
        <SecretRow
          label="IV (Initialization Vector)"
          value={programData.iv}
          icon={<span className="text-[9px] font-black leading-none">IV</span>}
        />
      </div>

      {/* CRUD Actions — Admin & Manager only */}
      {canEditDelete && (
        <div className="flex items-center justify-end gap-2 pt-1">
          {!isDeleted ? (
            <>
              <ProgramModal mode="edit" program={programData} user={user} types={types} groups={groups} />
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Nonaktifkan Program"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              disabled={isPending}
              onClick={handleRestore}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1db495] bg-[#1db495]/10 hover:bg-[#1db495]/20 rounded-xl transition-all disabled:opacity-50"
            >
              <RotateCcw size={15} /> Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
}
