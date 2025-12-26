"use client";

import { registerUser } from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { useState, useTransition } from "react";

export function Register({ nikFromSession }: { nikFromSession: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Fungsi Handler untuk membungkus Server Action
  async function handleFormSubmit(formData: FormData) {
    setError(null); // Reset error setiap kali submit
    
    startTransition(async () => {
      const result = await registerUser(formData);
      
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="p-8 w-full max-w-md shadow-2xl rounded-3xl border-none bg-white dark:bg-slate-900">
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-[#1db495] mb-4">
          <User size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Lengkapi Profil
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          NIK terdeteksi: <span className="font-mono font-bold text-[#1db495]">{nikFromSession}</span>
        </p>
      </div>

      {/* Menampilkan pesan error jika ada */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in zoom-in duration-300">
          <AlertCircle size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form action={handleFormSubmit} className="space-y-5">
        {/* NIK dikirim secara hidden untuk keamanan database update */}
        <input type="hidden" name="nik" value={nikFromSession} />
        
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">Nama Lengkap</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              name="firstName" 
              placeholder="Depan" 
              required 
              className="rounded-xl h-12 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#1db495]" 
            />
            <Input 
              name="lastName" 
              placeholder="Belakang" 
              required 
              className="rounded-xl h-12 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#1db495]" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">Email Perusahaan</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              name="email" 
              type="email" 
              placeholder="contoh@indomaret.co.id" 
              required 
              className="rounded-xl h-12 bg-slate-50 border-none pl-12 focus-visible:ring-2 focus-visible:ring-[#1db495]" 
            />
          </div>
        </div>

        <Button 
          disabled={isPending} 
          className="w-full h-14 bg-[#1db495] hover:bg-[#168a73] text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Memproses...</span>
            </div>
          ) : (
            "Simpan & Lanjutkan"
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Secure Access</span>
      </div>
    </Card>
  );
}