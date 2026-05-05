"use client";

import { submitRegistration } from "@/app/actions/register";
import { AlertCircle, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { useState, useTransition } from "react";

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  height: '48px',
  padding: '0 16px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1e293b',
  backgroundColor: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: '14px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#1db495';
  e.target.style.boxShadow = '0 0 0 3px rgba(29,180,149,0.15)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
}

export function Register({ nikFromSession }: { nikFromSession: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleFormSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitRegistration(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-black/10 border border-slate-100 p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex p-3.5 bg-[#1db495]/10 rounded-2xl text-[#1db495] mb-4 border border-[#1db495]/20">
          <User size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Lengkapi Profil
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          NIK terdeteksi:{" "}
          <span
            className="font-bold text-[#1db495]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {nikFromSession}
          </span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in zoom-in duration-300">
          <AlertCircle size={16} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form action={handleFormSubmit} className="space-y-5">
        <input type="hidden" name="nik" value={nikFromSession} />

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Nama Lengkap
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="firstName"
              placeholder="Nama Depan"
              required
              style={FIELD_STYLE}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <input
              name="lastName"
              placeholder="Nama Belakang"
              required
              style={FIELD_STYLE}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Email Perusahaan
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              name="email"
              type="email"
              placeholder="contoh@indomaret.co.id"
              required
              style={{ ...FIELD_STYLE, paddingLeft: '40px' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-13 bg-[#1db495] hover:bg-[#14866d] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#1db495]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{ height: '52px' }}
        >
          {isPending ? (
            <><Loader2 className="animate-spin" size={18} /> Memproses...</>
          ) : (
            "Simpan & Lanjutkan"
          )}
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Verified Secure Access
        </span>
      </div>
    </div>
  );
}
