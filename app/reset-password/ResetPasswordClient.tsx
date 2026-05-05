"use client";

import { forceResetPassword } from "@/app/actions/profile";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const FIELD =
  "w-full h-12 px-4 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:border-[#1db495] focus:ring-2 focus:ring-[#1db495]/20";

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        className={FIELD + " pr-12"}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ResetPasswordClient({ userId, firstName }: { userId: string; firstName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forceResetPassword(userId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Badge peringatan */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full">
            <ShieldAlert size={14} />
            Reset Password Wajib
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#1db495]/10 border border-[#1db495]/20 rounded-2xl flex items-center justify-center">
              <KeyRound size={22} className="text-[#1db495]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Buat Password Baru</h1>
              <p className="text-xs text-slate-400 font-medium">
                Halo, <span className="text-slate-600 font-bold">{firstName || "Member"}</span>
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 mb-6 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-sm text-amber-700 font-medium">
            Akun Anda baru ditambahkan oleh Administrator. Wajib membuat password sebelum bisa mengakses aplikasi.
          </div>

          {success ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-medium">
              <CheckCircle2 size={20} className="shrink-0" />
              Password berhasil dibuat! Mengarahkan ke dashboard...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Password Baru
                </label>
                <PasswordInput name="new_password" placeholder="Minimal 8 karakter" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Konfirmasi Password
                </label>
                <PasswordInput name="confirm_password" placeholder="Ulangi password baru" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-[#1db495] hover:bg-[#19a382] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                ) : (
                  <><Lock size={16} /> Simpan Password</>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Password harus minimal 8 karakter
        </p>
      </div>
    </div>
  );
}
