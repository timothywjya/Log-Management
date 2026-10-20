"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  programs: { id: number; program_name: string }[];
  levels: readonly string[];
};

const FIELD =
  "h-12 bg-white border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1db495] transition-all shadow-sm";

export default function LogFilters({ programs, levels }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // Dinaikkan saat Reset supaya input (yang uncontrolled) ikut kosong.
  const [resetKey, setResetKey] = useState(0);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // filter berubah -> kembali ke halaman 1
    const qs = params.toString();
    replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const onSearch = useDebouncedCallback((term: string) => update("query", term.trim()), 300);

  const hasFilter = ["query", "level", "program", "from", "to"].some((k) => searchParams.get(k));

  return (
    <div key={resetKey} className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          className={`${FIELD} w-full pl-12`}
          placeholder="Cari aplikasi, method, pesan, user, mesin..."
          defaultValue={searchParams.get("query") ?? ""}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <select
        className={FIELD}
        aria-label="Level"
        defaultValue={searchParams.get("level") ?? ""}
        onChange={(e) => update("level", e.target.value)}
      >
        <option value="">Semua level</option>
        {levels.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>

      <select
        className={`${FIELD} max-w-[14rem]`}
        aria-label="Program"
        defaultValue={searchParams.get("program") ?? ""}
        onChange={(e) => update("program", e.target.value)}
      >
        <option value="">Semua program</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.program_name}
          </option>
        ))}
      </select>

      <input
        type="date"
        className={FIELD}
        aria-label="Dari tanggal"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => update("from", e.target.value)}
      />
      <span className="text-slate-400 text-sm font-bold">s/d</span>
      <input
        type="date"
        className={FIELD}
        aria-label="Sampai tanggal"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => update("to", e.target.value)}
      />

      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            setResetKey((k) => k + 1);
            replace(pathname);
          }}
          className="flex items-center gap-1.5 h-12 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-red-500 transition-colors"
        >
          <X size={14} /> Reset
        </button>
      )}
    </div>
  );
}
