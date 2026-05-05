"use client";

import {
  authenticate,
  authenticateCredentials,
  verifyMfa,
} from "@/app/actions/auth";
import {
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Terminal,
  User,
  UserCog,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";

type Tab = "ess" | "credentials";
type Step = "login" | "mfa";

/* ── Tab Button ─────────────────────────────────────────── */
function TabButton({
  active, onClick, icon, label, sub,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
        active
          ? "bg-[#1db495] text-white shadow-lg shadow-[#1db495]/25"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`}
    >
      {icon}
      <span className="text-[10px] font-black tracking-wide leading-none">{label}</span>
      <span className={`text-[9px] font-medium leading-none ${active ? "text-white/70" : "text-slate-500"}`}>
        {sub}
      </span>
    </button>
  );
}

/* ── Password Input ─────────────────────────────────────── */
function PasswordInput({ id, name, placeholder = "••••••••" }: {
  id: string; name: string; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="group relative">
      <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 group-focus-within:text-[#1db495] transition-colors z-10 pointer-events-none" />
      <input
        id={id} name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        style={{
          height: '40px', width: '100%',
          paddingLeft: '34px', paddingRight: '36px',
          fontSize: '13px', fontWeight: 500,
          color: '#e2e8f0',
          backgroundColor: 'rgba(15,23,42,0.75)',
          border: '1.5px solid #334155',
          borderRadius: '10px', outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#1db495'; e.target.style.boxShadow = '0 0 0 2px rgba(29,180,149,0.2)'; }}
        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
      />
      <button
        type="button" onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1db495] transition-colors z-10"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* ── Error Banner ───────────────────────────────────────── */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-2 flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold animate-in fade-in zoom-in duration-300">
      <span className="shrink-0">⚠</span>
      <span>{message}</span>
    </div>
  );
}

/* ── Field Label ────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
      {children}
    </label>
  );
}

/* ── MFA Panel ──────────────────────────────────────────── */
function MfaPanel({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [error, setError] = useState("");
  const [isPending, start] = useTransition();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleOtpKey(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    const val = e.currentTarget.value;
    if (/\d/.test(e.key) && val.length === 1) refs.current[idx + 1]?.focus();
    if (e.key === "Backspace" && !val) refs.current[idx - 1]?.focus();
  }
  function handleOtpInput(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    e.target.value = v;
    if (v) refs.current[idx + 1]?.focus();
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = refs.current.map((r: any) => r?.value ?? "").join("").trim();
    if (token.length !== 6) { setError("Masukkan 6 digit kode OTP"); return; }
    const fd = new FormData();
    fd.set("user_id", String(userId));
    fd.set("mfa_token", token);
    start(async () => {
      const res = await verifyMfa(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <div className="w-10 h-10 bg-[#1db495]/15 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#1db495]/25">
          <Smartphone className="w-4 h-4 text-[#1db495]" />
        </div>
        <h2 className="text-sm font-black text-white">Verifikasi MFA</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Masukkan 6-digit kode dari <span className="font-bold text-[#1db495]">Authenticator</span>
        </p>
      </div>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el: any) => { refs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              onKeyDown={(e: any) => handleOtpKey(e, i)}
              onChange={(e: any) => handleOtpInput(e, i)}
              style={{
                width: '38px', height: '44px', textAlign: 'center',
                backgroundColor: '#1e293b', color: '#f1f5f9',
                border: '2px solid #334155', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 900, outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#1db495'; e.target.style.boxShadow = '0 0 0 2px rgba(29,180,149,0.25)'; }}
              onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
            />
          ))}
        </div>
        <button
          type="submit" disabled={isPending}
          className="h-10 w-full bg-[#1db495] hover:bg-[#14866d] text-white text-xs font-bold transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Memverifikasi...</>
            : <><ShieldCheck className="h-3.5 w-3.5" /> Verifikasi & Masuk</>}
        </button>
      </form>
      <div className="text-center">
        <button type="button" onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer">
          ← Kembali ke halaman login
        </button>
        <p className="text-[9px] text-slate-600 mt-0.5">Kode berlaku 30 detik • Toleransi ±1 window</p>
      </div>
    </div>
  );
}

/* ── ESS Form ───────────────────────────────────────────── */
function EssForm({ onMfaRequired }: { onMfaRequired: (userId: string) => void }) {
  const [nik, setNik] = useState("");
  const [error, setError] = useState("");
  const [isPending, start] = useTransition();

  function handleNik(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 10) setNik(v);
  }
  async function handleSubmit(formData: FormData) {
    setError("");
    start(async () => {
      const res = await authenticate(formData);
      if (res?.error) setError(res.error);
      if (res?.requiresMfa && res.userId) onMfaRequired(res.userId);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 animate-in fade-in duration-300">
      {error && <ErrorBanner message={error} />}

      <div>
        <FieldLabel>Nomor Induk Karyawan (NIK)</FieldLabel>
        <div className="relative group">
          <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 group-focus-within:text-[#1db495] transition-colors pointer-events-none z-10" />
          <input
            id="nik" name="nik" type="text" inputMode="numeric"
            placeholder="10 digit NIK Anda"
            value={nik} onChange={handleNik}
            style={{
              height: '40px', width: '100%',
              paddingLeft: '34px', paddingRight: '52px',
              fontSize: '13px', fontWeight: 500,
              color: '#e2e8f0',
              backgroundColor: 'rgba(15,23,42,0.75)',
              border: '1.5px solid #334155',
              borderRadius: '10px', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#1db495'; e.target.style.boxShadow = '0 0 0 2px rgba(29,180,149,0.2)'; }}
            onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black tabular-nums ${nik.length === 10 ? "text-[#1db495]" : "text-slate-600"}`}>
            {nik.length}/10
          </span>
        </div>
        <p className="text-[9px] text-slate-500 italic mt-1 ml-0.5">Hanya angka, tanpa spasi</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <FieldLabel>Password ESS</FieldLabel>
          <a href="http://ess1.indomaret.lan/ESS/HomePortal/Login" target="_blank" rel="noopener noreferrer"
            className="text-[9px] font-bold text-[#1db495] hover:underline">
            Lupa Password?
          </a>
        </div>
        <PasswordInput id="password-ess" name="password" />
        <p className="text-[9px] text-slate-500 italic mt-1 ml-0.5">Gunakan password ESS Indomaret Anda</p>
      </div>

      <button
        type="submit"
        disabled={nik.length !== 10 || isPending}
        className={`h-10 w-full text-white text-xs font-bold transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
          nik.length === 10 && !isPending
            ? "bg-[#1db495] hover:bg-[#14866d] shadow-md shadow-[#1db495]/25"
            : "bg-slate-700 cursor-not-allowed opacity-60"
        }`}
      >
        {isPending
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengautentikasi...</>
          : <>Masuk via ESS <ChevronRight className="h-3.5 w-3.5" /></>}
      </button>
    </form>
  );
}

/* ── Credentials Form ───────────────────────────────────── */
function CredentialsForm({ onMfaRequired }: { onMfaRequired: (userId: string) => void }) {
  const [error, setError] = useState("");
  const [isPending, start] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError("");
    start(async () => {
      const res = await authenticateCredentials(formData);
      if (res?.error) setError(res.error);
      if (res?.requiresMfa && res.userId) onMfaRequired(res.userId);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 animate-in fade-in duration-300">
      {error && <ErrorBanner message={error} />}

      <div>
        <FieldLabel>Username atau NIK</FieldLabel>
        <div className="relative group">
          <UserCog className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 group-focus-within:text-[#1db495] transition-colors pointer-events-none z-10" />
          <input
            id="username" name="username" type="text"
            placeholder="username atau NIK 10 digit"
            required
            style={{
              height: '40px', width: '100%',
              paddingLeft: '34px', paddingRight: '14px',
              fontSize: '13px', fontWeight: 500,
              color: '#e2e8f0',
              backgroundColor: 'rgba(15,23,42,0.75)',
              border: '1.5px solid #334155',
              borderRadius: '10px', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#1db495'; e.target.style.boxShadow = '0 0 0 2px rgba(29,180,149,0.2)'; }}
            onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <p className="text-[9px] text-slate-500 italic mt-1 ml-0.5">Bisa menggunakan username <em>atau</em> NIK</p>
      </div>

      <div>
        <FieldLabel>Password Aplikasi</FieldLabel>
        <PasswordInput id="password-cred" name="password" />
        <p className="text-[9px] text-slate-500 italic mt-1 ml-0.5">Password yang diset oleh Administrator</p>
      </div>

      <button
        type="submit" disabled={isPending}
        className="h-10 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
      >
        {isPending
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Memverifikasi...</>
          : <><KeyRound className="h-3.5 w-3.5" /> Masuk Kredensial</>}
      </button>

      <div className="flex items-center gap-2 justify-center">
        <ShieldCheck className="h-3 w-3 text-[#1db495] shrink-0" />
        <span className="text-[9px] text-slate-500 font-semibold">
          Dienkripsi Argon2id · JWT HTTP-Only Cookie
        </span>
      </div>
    </form>
  );
}

/* ── Main LoginForm ─────────────────────────────────────── */
export function LoginForm() {
  const [tab, setTab] = useState<Tab>("ess");
  const [step, setStep] = useState<Step>("login");
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);

  function handleMfaRequired(userId: string) { setMfaUserId(userId); setStep("mfa"); }
  function backToLogin() { setStep("login"); setMfaUserId(null); }

  return (
    /*
     * h-screen + overflow-hidden → card selalu muat di viewport tanpa scrollbar
     * Di mobile kembali ke normal (min-h-screen + overflow-y-auto)
     */
    <div className="flex w-full min-h-screen md:h-screen items-center justify-center
                    p-3 md:p-4 lg:p-6 select-none overflow-x-hidden md:overflow-hidden">
      <div
        className="grid w-full grid-cols-1 md:grid-cols-[1fr_1.05fr]
                   rounded-2xl md:rounded-3xl overflow-hidden
                   shadow-2xl shadow-black/40 bg-[#111827]
                   max-w-sm md:max-w-3xl lg:max-w-4xl
                   md:max-h-[calc(100vh-2rem)]"
      >
        {/* ── Left: Form Panel ── */}
        <div className="flex flex-col bg-[#0f172a] border-r border-slate-800/60
                        p-5 md:p-6 lg:p-7 overflow-y-auto">

          {/* Header — compact */}
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 text-[#1db495] mb-2">
              <div className="p-1 bg-[#1db495]/15 rounded-lg border border-[#1db495]/20">
                <Terminal className="h-3 w-3" />
              </div>
              <span className="text-[9px] font-extrabold tracking-[0.25em] uppercase">
                Log Management System
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
              {step === "mfa" ? "Verifikasi 2FA" : "Selamat Datang"}
            </h1>
            <p className="mt-1 text-[10px] text-slate-400 font-medium leading-relaxed">
              {step === "mfa"
                ? "Satu langkah lagi untuk keamanan maksimal"
                : "Masuk menggunakan akun ESS atau kredensial Anda"}
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 min-h-0">
            {step === "mfa" && mfaUserId ? (
              <MfaPanel userId={mfaUserId} onBack={backToLogin} />
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-1 bg-[#1e2d45] p-1 rounded-xl mb-3">
                  <TabButton active={tab === "ess"} onClick={() => setTab("ess")}
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Login ESS" sub="NIK + Password" />
                  <TabButton active={tab === "credentials"} onClick={() => setTab("credentials")}
                    icon={<KeyRound className="h-3.5 w-3.5" />}
                    label="Login Alternatif" sub="Username + Password" />
                </div>

                {/* Info banner — compact */}
                {tab === "ess" ? (
                  <div className="mb-3 flex items-start gap-2 px-2.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-400 mt-px" />
                    <p className="text-[10px] leading-relaxed">
                      Login utama via server ESS Indomaret. Gunakan NIK dan password portal ESS.
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 flex items-start gap-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-px" />
                    <p className="text-[10px] leading-relaxed">
                      Login alternatif jika server ESS tidak dapat diakses.
                    </p>
                  </div>
                )}

                {tab === "ess"
                  ? <EssForm onMfaRequired={handleMfaRequired} />
                  : <CredentialsForm onMfaRequired={handleMfaRequired} />}
              </>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
                Created by: Indonesia Code Party
              </span>
            </div>
          </footer>
        </div>

        {/* ── Right: Brand Panel ── */}
        <div className="relative hidden md:flex flex-col justify-between
                        p-7 lg:p-10
                        bg-gradient-to-br from-[#1db495] via-[#16a382] to-[#0b6b5a]
                        overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
          {/* Blobs */}
          <div className="absolute -top-20 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-16 w-56 h-56 bg-black/15 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                Control Your<br />
                <span className="text-emerald-200">System Logs.</span>
              </h2>
              <div className="h-1 w-12 rounded-full bg-white/50 mt-3 mb-3" />
              <p className="max-w-xs text-xs lg:text-sm leading-relaxed text-emerald-50/80 font-medium">
                Monitor aktivitas aplikasi secara real-time dengan keamanan berlapis dan audit trail lengkap.
              </p>
            </div>
          </div>

          <div className="relative z-10 text-[9px] text-white/40 uppercase tracking-widest font-bold">
            Log Management System · v1.3.4
          </div>
        </div>
      </div>
    </div>
  );
}
