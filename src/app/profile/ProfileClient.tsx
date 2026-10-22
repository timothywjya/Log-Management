"use client";

import type { UserWithAccess } from "@/domain/entities/user";
import { updateProfileAction } from "@/presentation/actions/profile";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useState, useTransition } from "react";

// ─── Style helpers ────────────────────────────────────────────
const FIELD =
  "w-full h-12 px-4 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:border-[#1db495] focus:ring-2 focus:ring-[#1db495]/20 disabled:opacity-50";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
      {children}
    </label>
  );
}

function Alert({ type, msg }: { type: "error" | "success"; msg: string }) {
  const isErr = type === "error";
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-1 duration-200
        ${isErr ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}
    >
      {isErr ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
      {msg}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────
function Card({ children, title, icon }: { children: React.ReactNode; title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="p-2.5 bg-[#1db495]/10 rounded-xl text-[#1db495] border border-[#1db495]/15">
          {icon}
        </div>
        <h2 className="text-base font-black text-slate-800 tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────
export default function ProfileClient({ user }: { user: UserWithAccess }) {
  // ── Info profil state ──
  const [profilePending, startProfile] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Handlers ──
  function handleProfile(formData: FormData) {
    setProfileMsg(null);
    startProfile(async () => {
      const res = await updateProfileAction(formData);
      if (res?.error) setProfileMsg({ type: "error", text: res.error });
      else setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">
          Kelola informasi akun Anda
        </p>
      </header>

      {/* ── Info Akun (readonly) ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-tr from-[#1db495] to-emerald-400 rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <UserIcon size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-slate-900 truncate">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-slate-400 font-medium truncate">{user.user_email ?? "—"}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                NIK: {user.nik}
              </span>
              {user.program_group && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1db495]/10 text-[#1db495] border border-[#1db495]/20 uppercase tracking-wider">
                  {user.program_group.group_name}
                </span>
              )}
              {user.role && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-wider">
                  {user.role.role_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider hidden sm:block">Verified</span>
          </div>
        </div>
      </div>

      {/* ── Update Info Profil ───────────────────────────────── */}
      <Card title="Informasi Profil" icon={<UserIcon size={18} />}>
        {profileMsg && <div className="mb-5"><Alert type={profileMsg.type} msg={profileMsg.text} /></div>}

        <form action={handleProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nama Depan</Label>
              <input
                name="first_name"
                defaultValue={user.first_name ?? ""}
                placeholder="Nama Depan"
                required
                className={FIELD}
              />
            </div>
            <div>
              <Label>Nama Belakang</Label>
              <input
                name="last_name"
                defaultValue={user.last_name ?? ""}
                placeholder="Nama Belakang"
                required
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <Label>Email Perusahaan</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                name="user_email"
                type="email"
                defaultValue={user.user_email ?? ""}
                placeholder="email@indomaret.co.id"
                required
                className={FIELD + " pl-10"}
              />
            </div>
          </div>

          {/* readonly info */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            {[
              { label: "NIK", value: user.nik },
              { label: "Role", value: user.role?.role_name ?? "—" },
              { label: "Grup", value: user.program_group?.group_name ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <Label>{label}</Label>
                <div className="h-12 px-4 flex items-center text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profilePending}
              className="h-12 px-8 bg-[#1db495] hover:bg-[#14866d] text-white text-sm font-bold rounded-2xl shadow shadow-[#1db495]/25 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
            >
              {profilePending ? <><Loader2 size={15} className="animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
