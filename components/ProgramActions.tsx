"use client";

import { deleteProgram, restoreProgram } from "@/app/actions/program";
import { Edit3, RefreshCcw, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface ProgramActionsProps {
  id: number;
  isDeleted: boolean;
  canEditDelete: boolean;
  programData: any;
}

export default function ProgramActions({ id, isDeleted, canEditDelete, programData }: ProgramActionsProps) {
  
  const handleDelete = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `You are about to delete "${programData.program_name}"`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1db495",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "Yes, delete it!",
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.borderRadius = "2rem"; 
      }
    }
  });

  if (result.isConfirmed) {
    try {
      await deleteProgram(id);
      Swal.fire({
        title: "Deleted!",
        text: "Program has been moved to inactive.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) popup.style.borderRadius = "2rem";
        }
      });
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  }
};

  const handleRestore = async () => {
    const result = await Swal.fire({
      title: "Restore Program?",
      text: `Make "${programData.program_name}" active again?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1db495",
      confirmButtonText: "Yes, restore!",
    });

    if (result.isConfirmed) {
      await restoreProgram(id);
      Swal.fire("Restored!", "Program is now active.", "success");
    }
  };

  if (!canEditDelete) {
    return (
      <div className="pt-5 border-t border-slate-50 mt-4">
        <span className="text-[10px] italic text-slate-300 font-medium">Read-only access</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 pt-5 border-t border-slate-50 mt-4">
      {!isDeleted ? (
        <>
          <button 
            onClick={() => console.log("Open Edit Modal")}
            className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 hover:text-blue-700"
          >
            <Edit3 size={14} /> Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-700"
          >
            <Trash2 size={14} /> Delete
          </button>
        </>
      ) : (
        <button 
          onClick={handleRestore}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#1db495] hover:text-[#168a73] bg-[#1db495]/10 px-4 py-2 rounded-xl"
        >
          <RefreshCcw size={14} /> Restore Program
        </button>
      )}
    </div>
  );
}