"use client";

import { AlertTriangle, Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

type Props = {
  programName: string;
  secretKey: string;
  onClose: () => void;
};

/**
 * Menampilkan secret key SATU KALI. Setelah dialog ditutup, key asli tidak bisa
 * dilihat lagi karena di database hanya tersimpan hash-nya.
 */
export default function SecretKeyDialog({ programName, secretKey, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
    } catch {
      // Fallback untuk koneksi HTTP (clipboard API butuh HTTPS)
      const el = document.createElement("textarea");
      el.value = secretKey;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-[#1db495]/10 text-[#1db495] rounded-2xl">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Secret <span className="text-[#1db495]">Key</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold">{programName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 mb-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Salin dan simpan key ini sekarang. Demi keamanan, key <b>tidak akan ditampilkan lagi</b>.
            Jika hilang, Anda harus generate ulang dan key lama otomatis tidak berlaku.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 rounded-2xl p-3 pl-4">
          <code className="flex-1 min-w-0 break-all text-[13px] text-emerald-300 font-mono select-all">
            {secretKey}
          </code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>

        <label className="flex items-center gap-2 mt-5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="accent-[#1db495] w-4 h-4"
          />
          Saya sudah menyimpan key ini di tempat yang aman
        </label>

        <button
          type="button"
          disabled={!saved}
          onClick={onClose}
          className="w-full h-12 mt-5 bg-[#1db495] text-white rounded-2xl font-black hover:bg-[#168a73] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
