import LogFilters from "@/components/log/LogFilters";
import LogTable from "@/components/log/LogTable";
import LogTabs from "@/components/log/LogTabs";
import Sidebar from "@/components/sidebar";
import { requireUser } from "@/lib/auth";
import db from "@/lib/db";
import { CATEGORY_META, LOG_LEVELS, isLogCategory, isLogLevel } from "@/lib/log-category";
import { countByLevel, countLogs, findLogs, type LogFilter } from "@/lib/log-store";
import { canSeeAllPrograms } from "@/lib/permissions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 25;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const FILTER_KEYS = ["query", "level", "program", "from", "to"] as const;

type SearchParams = {
  query?: string;
  level?: string;
  program?: string;
  from?: string;
  to?: string;
  page?: string;
};

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

/** Tanggal dari filter (yyyy-mm-dd) dibaca sebagai waktu WIB (UTC+7). */
function parseDay(value: string | undefined, endOfDay: boolean): Date | undefined {
  if (!value || !DATE_RE.test(value)) return undefined;
  const d = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function pageHref(base: string, sp: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    if (v) params.set(k, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function LogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();

  const { category } = await params;
  if (!isLogCategory(category)) notFound();

  const sp = await searchParams;
  const query = (sp.query ?? "").trim().slice(0, 100);
  const level = sp.level && isLogLevel(sp.level) ? sp.level : undefined;
  const programId = Number.parseInt(sp.program ?? "", 10);
  const from = parseDay(sp.from, false);
  const to = parseDay(sp.to, true);
  const requestedPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Aturan akses sama dengan halaman Program: admin/role tertentu melihat semua,
  // selain itu hanya log dari program milik group-nya. Dicek di QUERY, bukan di UI.
  const canSeeAll = canSeeAllPrograms(user);
  const programScope = canSeeAll ? {} : { program_group_id: user.group_id || 0 };

  const programs = await db.program.findMany({
    where: programScope,
    select: { id: true, program_name: true },
    orderBy: { program_name: "asc" },
  });

  // Tabel log menyimpan program sebagai teks (*_program_id), bukan relasi.
  const scopeProgramIds = canSeeAll ? null : programs.map((p) => String(p.id));
  const programNames = new Map(programs.map((p) => [String(p.id), p.program_name]));

  const filter: LogFilter = {
    query: query || undefined,
    level,
    programId: Number.isInteger(programId) && programId > 0 ? programId : undefined,
    scopeProgramIds,
    from,
    to,
  };

  const total = await countLogs(category, filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const [logs, byLevel] = await Promise.all([
    findLogs(category, filter, { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    countByLevel(category, scopeProgramIds, hoursAgo(24)),
  ]);

  const total24h = Object.values(byLevel).reduce((sum, n) => sum + n, 0);
  const errors24h = (byLevel.error ?? 0) + (byLevel.fatal ?? 0);

  const meta = CATEGORY_META[category];
  const base = `/log/${category}`;
  const hasFilter = FILTER_KEYS.some((k) => sp[k]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />

      <main className="ml-64 p-8 w-full">
        <header className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Activity <span className="text-[#1db495]">Log</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            {meta.description}{" "}
            {canSeeAll ? "Menampilkan semua program." : `Program tim ${user.program_group?.group_name ?? "-"}.`}
          </p>
        </header>

        <LogTabs active={category} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Log 24 jam terakhir" value={total24h} />
          <SummaryCard label="Error 24 jam" value={errors24h} tone="red" />
          <SummaryCard label="Warning 24 jam" value={byLevel.warn ?? 0} tone="amber" />
        </div>

        <LogFilters programs={programs} levels={LOG_LEVELS} />

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {logs.length > 0 ? (
            <LogTable logs={logs} category={category} programNames={programNames} />
          ) : (
            <div className="py-20 px-6 text-center">
              <p className="text-slate-400 font-medium italic">
                {hasFilter
                  ? "Tidak ada log yang cocok dengan filter."
                  : `Belum ada log ${meta.label}.`}
              </p>
              {!hasFilter && (
                <p className="text-xs text-slate-400 mt-2">
                  Program mengirim log ke <code className="font-mono">POST /api/log</code> dengan header{" "}
                  <code className="font-mono">x-program-key</code>.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-bold text-slate-400">
            <span>
              {total.toLocaleString("id-ID")} log · halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <PageLink href={pageHref(base, sp, page - 1)} disabled={page <= 1} label="Sebelumnya">
                <ChevronLeft size={14} />
              </PageLink>
              <PageLink href={pageHref(base, sp, page + 1)} disabled={page >= totalPages} label="Berikutnya">
                <ChevronRight size={14} />
              </PageLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "red" | "amber";
}) {
  const color =
    tone === "red" ? "text-red-500" : tone === "amber" ? "text-amber-500" : "text-slate-900";
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${color}`}>{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "flex items-center justify-center w-9 h-9 rounded-xl border transition-all";
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={`${cls} border-slate-100 text-slate-200`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${cls} border-slate-200 text-slate-500 hover:text-[#1db495] hover:border-[#1db495]/40`}
    >
      {children}
    </Link>
  );
}
