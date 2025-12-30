"use client";

import { deleteProgram, restoreProgram } from "@/app/actions/program";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTransition } from "react";
import Swal from "sweetalert2";
import ProgramModal from "./modal/ProgramModal";

export default function ProgramActions({ id, isDeleted, canEditDelete, programData, user, types, groups }: any) {
  const [isPending, startTransition] = useTransition();

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
          try {
            await deleteProgram(id);
            Swal.fire({
              title: "Deleted!",
              text: "Program has been moved to trash.",
              icon: "success",
              customClass: { popup: 'rounded-[2.5rem]' }
            });
          } catch (error) {
            Swal.fire("Error", "Failed to delete program", "error");
          }
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
          try {
            await restoreProgram(id);
            Swal.fire({
              title: "Restored!",
              text: "Program is now active again.",
              icon: "success",
              customClass: { popup: 'rounded-[2.5rem]' }
            });
          } catch (error) {
            Swal.fire("Error", "Failed to restore program", "error");
          }
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
      {!isDeleted ? (
        <>
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
    </div>
  );
}