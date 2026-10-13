"use client";

import { deleteProgram, regenerateProgramKey, restoreProgram } from "@/app/actions/program";
import SecretKeyDialog from "@/components/SecretKeyDialog";
import { KeyRound, RotateCcw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";
import ProgramModal from "./modal/ProgramModal";

export default function ProgramActions({ id, isDeleted, canEditDelete, programData, hasKey, user, types, groups }: any) {
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<{ programName: string; secretKey: string } | null>(null);

  if (!canEditDelete) return null;

  const themeColor = "#1db495";

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${programData.program_name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2.5rem]', 
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await deleteProgram(id);
          if (!res.ok) {
            Swal.fire("Error", res.error, "error");
            return;
          }
          Swal.fire({
            title: "Deleted!",
            text: "Program has been moved to trash.",
            icon: "success",
            customClass: { popup: 'rounded-[2.5rem]' }
          });
        });
      }
    });
  };

  const handleRestore = () => {
    Swal.fire({
      title: "Restore Program?",
      text: `Reactivate "${programData.program_name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: themeColor,
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, restore!",
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await restoreProgram(id);
          if (!res.ok) {
            Swal.fire("Error", res.error, "error");
            return;
          }
          Swal.fire({
            title: "Restored!",
            text: "Program is now active again.",
            icon: "success",
            customClass: { popup: 'rounded-[2.5rem]' }
          });
        });
      }
    });
  };

  const handleGenerateKey = () => {
    Swal.fire({
      title: hasKey ? "Generate ulang key?" : "Generate secret key?",
      text: hasKey
        ? "Key lama akan langsung tidak berlaku. Semua aplikasi yang memakainya harus diperbarui."
        : `Buat secret key untuk "${programData.program_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: themeColor,
      cancelButtonColor: "#64748b",
      confirmButtonText: hasKey ? "Ya, generate ulang" : "Ya, generate",
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    }).then((result) => {
      if (!result.isConfirmed) return;
      startTransition(async () => {
        const res = await regenerateProgramKey(id);
        if (!res.ok) {
            Swal.fire("Error", res.error, "error");
            return;
          }
        setNewKey({ programName: res.programName, secretKey: res.secretKey });
      });
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
      {!isDeleted ? (
        <>
          <button
            disabled={isPending}
            onClick={handleGenerateKey}
            title={hasKey ? "Generate ulang secret key" : "Generate secret key"}
            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-50"
          >
            <KeyRound size={18} />
          </button>
          <ProgramModal mode="edit" program={programData} user={user} types={types} groups={groups} />
          <button 
            disabled={isPending} 
            onClick={handleDelete} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={18} />
          </button>
        </>
      ) : (
        <button 
          disabled={isPending} 
          onClick={handleRestore} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1db495] bg-[#1db495]/10 hover:bg-[#1db495]/20 rounded-xl transition-all"
        >
          <RotateCcw size={16} /> Restore
        </button>
      )}
      {newKey && <SecretKeyDialog {...newKey} onClose={() => setNewKey(null)} />}
    </div>
  );
}
