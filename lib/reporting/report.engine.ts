/**
 * REPORTING ENGINE — Modular & Extensible
 * Tambah jenis report baru cukup daftarkan di REPORT_REGISTRY.
 * Tidak perlu mengubah kode lain.
 */

import { logRepository, LogFilter } from "@/lib/repositories/log.repository";
import prisma from "@/lib/db";

export interface ReportResult {
  type: string;
  title: string;
  data: any;
  generatedAt: Date;
  filter: any;
}

// ─── Report Handler Interface ─────────────────────
export interface ReportHandler {
  name: string;
  description: string;
  generate(params: any): Promise<ReportResult>;
}

// ─── Concrete Report Handlers ─────────────────────

export const MonthlyReportHandler: ReportHandler = {
  name: "monthly",
  description: "Ringkasan log per bulan",
  async generate(params: { year: number; month: number }) {
    const { year, month } = params;
    const data = await logRepository.getMonthlyLogSummary(year, month);

    // Breakdown per program
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    const byProgram = await logRepository.getLogCountByProgram({ startDate: start, endDate: end });

    return {
      type: "monthly",
      title: `Laporan Bulanan — ${month}/${year}`,
      data: { summary: data, byProgram },
      generatedAt: new Date(),
      filter: { year, month },
    };
  },
};

export const PeriodReportHandler: ReportHandler = {
  name: "period",
  description: "Laporan rentang waktu custom",
  async generate(params: { startDate: string; endDate: string; programId?: string }) {
    const start = new Date(params.startDate);
    const end   = new Date(params.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Tanggal tidak valid");

    const filter: LogFilter = { startDate: start, endDate: end, programId: params.programId };
    const [apiLogs, webLogs] = await Promise.all([
      logRepository.findApiLogs(filter, { page: 1, limit: 500 }),
      logRepository.findWebLogs(filter, { page: 1, limit: 500 }),
    ]);
    const summary = await logRepository.getLogCountByProgram(filter);

    return {
      type: "period",
      title: `Laporan Periode ${params.startDate} s/d ${params.endDate}`,
      data: { apiLogs: apiLogs.data, webLogs: webLogs.data, summary },
      generatedAt: new Date(),
      filter: params,
    };
  },
};

export const TeamReportHandler: ReportHandler = {
  name: "team",
  description: "Laporan per tim / group",
  async generate(params: { groupId: string; startDate?: string; endDate?: string }) {
    const filter: LogFilter = {
      groupId: params.groupId,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate:   params.endDate   ? new Date(params.endDate)   : undefined,
    };
    const data = await logRepository.getLogSummaryByTeam(filter);

    return {
      type: "team",
      title: "Laporan Per Tim",
      data,
      generatedAt: new Date(),
      filter: params,
    };
  },
};

// ─── Report Registry ─────────────────────────────
// Tambah handler baru di sini tanpa mengubah kode lain
export const REPORT_REGISTRY: Record<string, ReportHandler> = {
  monthly: MonthlyReportHandler,
  period:  PeriodReportHandler,
  team:    TeamReportHandler,
};

// ─── Engine ───────────────────────────────────────
export async function generateReport(type: string, params: any): Promise<ReportResult> {
  const handler = REPORT_REGISTRY[type];
  if (!handler) throw new Error(`Report type "${type}" tidak ditemukan`);
  return handler.generate(params);
}

export function getAvailableReportTypes() {
  return Object.entries(REPORT_REGISTRY).map(([key, h]) => ({
    key, name: h.name, description: h.description,
  }));
}
