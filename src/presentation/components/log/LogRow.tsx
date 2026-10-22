"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

// Semua prop berupa string/array sederhana yang sudah diformat di server
// (BigInt & Date tidak boleh dikirim langsung ke client component).
export type LogRowData = {
  id: string;
  time: string;
  level: string;
  program: string;
  application: string;
  method: string;
  user: string;
  cells: string[];
  message: string;
  exception: string;
  stackTrace: string;
  argsJson: string;
  returnJson: string;
  details: { label: string; value: string }[];
};

const LEVEL_STYLE: Record<string, string> = {
  trace: "bg-slate-100 text-slate-400",
  debug: "bg-slate-100 text-slate-500",
  info: "bg-sky-100 text-sky-600",
  warn: "bg-amber-100 text-amber-600",
  error: "bg-red-100 text-red-600",
  fatal: "bg-red-600 text-white",
};

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xs font-medium text-slate-700 break-all">{value}</p>
    </div>
  );
}

function TextBlock({ label, value, tone }: { label: string; value: string; tone?: "red" }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-xs whitespace-pre-wrap break-words ${tone === "red" ? "text-red-600" : "text-slate-700"}`}>
        {value}
      </p>
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <pre className="text-[11px] font-mono bg-white border border-slate-100 rounded-2xl p-4 overflow-x-auto max-h-64 text-slate-600">
        {value}
      </pre>
    </div>
  );
}

export default function LogRow({ row, colSpan }: { row: LogRowData; colSpan: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="p-4 pl-5 text-slate-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
        <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">{row.time}</td>
        <td className="p-4">
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
              LEVEL_STYLE[row.level] ?? LEVEL_STYLE.info
            }`}
          >
            {row.level}
          </span>
        </td>
        <td className="p-4 text-xs font-bold text-slate-600">{row.program || <span className="text-slate-300">—</span>}</td>
        <td className="p-4 text-xs font-bold text-slate-800">{row.application}</td>
        <td className="p-4 text-xs text-slate-700 max-w-[14rem] truncate" title={row.method}>
          {row.method || <span className="text-slate-300">—</span>}
        </td>
        {row.cells.map((c, i) => (
          <td key={i} className="p-4 text-xs text-slate-600 max-w-[16rem] truncate" title={c}>
            {c || <span className="text-slate-300">—</span>}
          </td>
        ))}
        <td className="p-4 text-xs text-slate-500">{row.user || <span className="text-slate-300">—</span>}</td>
      </tr>

      {open && (
        <tr className="bg-slate-50/70">
          <td />
          <td colSpan={colSpan - 1} className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {row.details.map((d) => (
                <Detail key={d.label} label={d.label} value={d.value} />
              ))}
            </div>
            <TextBlock label="Pesan" value={row.message} />
            <TextBlock label="Exception" value={row.exception} tone="red" />
            <CodeBlock label="Stack trace" value={row.stackTrace} />
            <CodeBlock label="Method arguments" value={row.argsJson} />
            <CodeBlock label="Return value" value={row.returnJson} />
          </td>
        </tr>
      )}
    </>
  );
}
