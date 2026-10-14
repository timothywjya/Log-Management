"use client";

import { updateProfileAction, updatePasswordAction } from "@/app/actions/profile";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
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

function PasswordInput({
  name,
  placeholder,
  required,
}: {
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required={required}
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
export default function ProfileClient({ user }: { user: any }) {
  // ── Info profil state ──
  const [profilePending, startProfile] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Password state ──
  const [pwPending, startPw] = useTransition();
  const [pwMsg, setPwMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const hasPassword = !!user.password_hash;

  // ── Handlers ──
  function handleProfile(formData: FormData) {
    setProfileMsg(null);
    startProfile(async () => {
      const res = await updateProfileAction(formData);
      if (res?.error) setProfileMsg({ type: "error", text: res.error });
      else setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
    });
  }

  function handlePassword(formData: FormData) {
    setPwMsg(null);
    startPw(async () => {
      const res = await updatePasswordAction(formData);
      if (res?.error) setPwMsg({ type: "error", text: res.error });
      else {
        setPwMsg({ type: "success", text: "Password berhasil diperbarui!" });
        (document.getElementById("pw-form") as HTMLFormElement)?.reset();
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">
          Kelola informasi akun dan keamanan Anda
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
              {user.team && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-wider">
                  {user.team.team_name}
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
              { label: "Tim", value: user.team?.team_name ?? "—" },
              { label: "Sub Tim", value: user.sub_team?.sub_team_name ?? "—" },
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

      {/* ── Update Password ──────────────────────────────────── */}
      <Card title="Keamanan & Password" icon={<KeyRound size={18} />}>
        {pwMsg && <div className="mb-5"><Alert type={pwMsg.type} msg={pwMsg.text} /></div>}

        {!hasPassword && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 font-medium">
            <Lock size={15} className="shrink-0" />
            Anda belum memiliki password. Set password untuk mengaktifkan login via username.
          </div>
        )}

        <form id="pw-form" action={handlePassword} className="space-y-4">
          {hasPassword && (
            <div>
              <Label>Password Saat Ini</Label>
              <PasswordInput name="current_password" placeholder="Masukkan password saat ini" required />
            </div>
          )}

          <div>
            <Label>Password Baru</Label>
            <PasswordInput name="new_password" placeholder="Minimal 8 karakter" required />
          </div>

          <div>
            <Label>Konfirmasi Password Baru</Label>
            <PasswordInput name="confirm_password" placeholder="Ulangi password baru" required />
          </div>

          <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="shrink-0 text-[#1db495]" />
            Password tersimpan terenkripsi dengan bcrypt (12 rounds)
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={pwPending}
              className="h-12 px-8 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl shadow shadow-slate-800/20 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
            >
              {pwPending ? <><Loader2 size={15} className="animate-spin" />Memperbarui...</> : "Perbarui Password"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
