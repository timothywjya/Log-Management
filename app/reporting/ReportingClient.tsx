"use client";

import { BarChart3, Calendar, Clock, FileDown, Loader2, Users } from "lucide-react";
import { useState } from "react";

type ReportType = "monthly" | "period" | "team";

const INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  marginTop: '6px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1e293b',
  backgroundColor: '#f8fafc',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function ReportInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
      <input
        {...props}
        style={{ ...INPUT_STYLE, ...(props.style ?? {}) }}
        onFocus={e => { e.target.style.borderColor = '#1db495'; e.target.style.boxShadow = '0 0 0 3px rgba(29,180,149,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

export default function ReportingClient() {
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [groupId, setGroupId]     = useState<number>(1);

  async function runReport() {
    setLoading(true); setError(""); setResult(null);
    try {
      let params: any = {};
      if (reportType === "monthly") params = { year, month };
      if (reportType === "period")  params = { startDate, endDate };
      if (reportType === "team")    params = { groupId };

      const csrfToken =
        document.cookie.split("; ").find(r => r.startsWith("csrf_token="))?.split("=")[1] ?? "";

      const res = await fetch("/api/reporting", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ type: reportType, ...params }),
      });

      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const REPORT_TYPES = [
    { key: "monthly" as ReportType, label: "Bulanan", icon: <Calendar className="h-4 w-4" />, desc: "Ringkasan per bulan" },
    { key: "period"  as ReportType, label: "Periode", icon: <Clock className="h-4 w-4" />,    desc: "Rentang tanggal" },
    { key: "team"    as ReportType, label: "Per Tim",  icon: <Users className="h-4 w-4" />,   desc: "Filter per grup" },
  ];

  return (
    <div className="space-y-5">
      {/* Report Type Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Jenis Laporan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REPORT_TYPES.map(({ key, label, icon, desc }) => (
            <button
              key={key}
              onClick={() => setReportType(key)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                reportType === key
                  ? "border-[#1db495] bg-[#1db495]/5 text-[#1db495]"
                  : "border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${reportType === key ? "bg-[#1db495]/15" : "bg-slate-100"}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Parameter Laporan
        </p>

        {reportType === "monthly" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <ReportInput
              label="Tahun"
              type="number"
              value={year}
              onChange={e => setYear(+e.target.value)}
              style={{ maxWidth: '120px' }}
            />
            <ReportInput
              label="Bulan (1–12)"
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={e => setMonth(+e.target.value)}
              style={{ maxWidth: '110px' }}
            />
          </div>
        )}

        {reportType === "period" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <ReportInput
              label="Tanggal Mulai"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <ReportInput
              label="Tanggal Selesai"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        )}

        {reportType === "team" && (
          <ReportInput
            label="Group ID"
            type="number"
            value={groupId}
            onChange={e => setGroupId(+e.target.value)}
            style={{ maxWidth: '110px' }}
          />
        )}

        <button
          onClick={runReport}
          disabled={loading}
          className="mt-5 flex items-center gap-2 bg-[#1db495] hover:bg-[#14866d] text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-[#1db495]/25"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
          ) : (
            <><BarChart3 className="h-4 w-4" /> Generate Report</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium flex items-start gap-2">
          <span className="text-base shrink-0">⚠</span>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="font-black text-slate-900 text-base">{result.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dibuat: {new Date(result.generatedAt).toLocaleString("id-ID")}
              </p>
            </div>
            <button className="self-start sm:self-auto flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1db495] border border-slate-200 hover:border-[#1db495] px-3 py-2 rounded-xl transition-all cursor-pointer">
              <FileDown className="h-3.5 w-3.5" /> Export
            </button>
          </div>

          {result.type === "monthly" && result.data?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {(["api", "web", "desktop", "app", "total"] as const).map((key) => (
                <div key={key} className={`rounded-2xl p-4 text-center border ${key === 'total' ? 'bg-[#1db495]/5 border-[#1db495]/20' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-2xl font-black ${key === 'total' ? 'text-[#1db495]' : 'text-slate-800'}`}>
                    {result.data.summary[key] ?? 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{key}</p>
                </div>
              ))}
            </div>
          )}

          {(result.type === "period" || result.type === "team") && (
            <pre
              className="text-xs rounded-2xl p-4 overflow-auto max-h-96 font-mono leading-relaxed"
              style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}
            >
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
