import { LOG_CATEGORIES, categoryFromTypeName, type LogCategory, type LogLevel } from "@/domain/log/log-category";
import type { NewLog } from "@/domain/log/log-entry";
import type { AuthenticatedProgram } from "@/domain/entities/program";
import type { LogRepository } from "@/application/ports/log.repository";
import type { RateLimiter } from "@/application/ports/rate-limiter";
import type { ReferenceRepository } from "@/application/ports/reference.repository";

/** Satu log masuk dari program (sudah divalidasi bentuknya oleh lapisan HTTP). */
export type IngestLogEntry = {
  category?: LogCategory;
  level: LogLevel;
  /** Nama kejadian; disimpan di kolom *_method_name kecuali `method_name` diisi. */
  action: string;
  message?: string;
  actor?: string;
  ip_address?: string;
  device?: string;
  app_version?: string;
  occurred_at?: string;
  metadata?: Record<string, string | number | boolean | null>;

  application?: string;
  module?: string;
  form_name?: string;
  method_name?: string;
  correlation_id?: string;
  transaction_no?: string;
  station_id?: string;
  device_id?: string;
  device_type?: string;
  device_merk?: string;
  branch_code?: string;
  store_code?: string;
  os_version?: string;
  thread_id?: string;
  execution_time_ms?: number;
  exception_message?: string;
  stack_trace?: string;
};

export type IngestOutcome =
  | { ok: true; received: number }
  | { ok: false; code: "rate_limited"; retryAfter: number; error: string }
  | { ok: false; code: "category_required"; error: string }
  | { ok: false; code: "storage_failed"; error: string };

const FUTURE_TOLERANCE_MS = 5 * 60_000; // toleransi selisih jam 5 menit

export class IngestLogs {
  constructor(
    private readonly logs: LogRepository,
    private readonly reference: ReferenceRepository,
    private readonly limiter: RateLimiter
  ) {}

  async execute(program: AuthenticatedProgram, entries: IngestLogEntry[], now = new Date()): Promise<IngestOutcome> {
    // 1) Pembatasan laju per program.
    const limit = this.limiter.consume(program.id, entries.length);
    if (!limit.ok) {
      return {
        ok: false,
        code: "rate_limited",
        retryAfter: limit.retryAfter,
        error: "Terlalu banyak log. Coba lagi sebentar.",
      };
    }

    // 2) Tentukan kategori: dari body, jika tidak ada diturunkan dari tipe program.
    let fallback: LogCategory | null = null;
    if (entries.some((e) => !e.category)) {
      const typeName = await this.reference.findProgramTypeName(program.program_type_id);
      fallback = categoryFromTypeName(typeName);
      if (!fallback) {
        return {
          ok: false,
          code: "category_required",
          error: `category wajib diisi (${LOG_CATEGORIES.join(" | ")}); tipe program tidak bisa dipetakan otomatis.`,
        };
      }
    }

    // 3) Petakan ke baris log.
    const futureLimit = now.getTime() + FUTURE_TOLERANCE_MS;
    const items = entries.map((e) => {
      const occurred = e.occurred_at ? new Date(e.occurred_at) : now;
      const metaDuration =
        typeof e.metadata?.duration_ms === "number" ? Math.round(e.metadata.duration_ms) : undefined;
      const metaOs = typeof e.metadata?.os === "string" ? e.metadata.os.slice(0, 150) : undefined;

      const log: NewLog = {
        occurredAt: occurred.getTime() > futureLimit ? now : occurred,
        level: e.level,
        correlationId: e.correlation_id,
        application: e.application ?? program.program_name.slice(0, 100),
        module: e.module,
        formName: e.form_name,
        methodName: e.method_name ?? e.action,
        userId: e.actor,
        stationId: e.station_id,
        deviceId: e.device_id ?? e.device,
        deviceType: e.device_type,
        deviceMerk: e.device_merk,
        branchCode: e.branch_code,
        storeCode: e.store_code,
        transactionNo: e.transaction_no,
        programId: String(program.id),
        message: e.message,
        methodArguments: e.metadata,
        executionTimeMs: e.execution_time_ms ?? metaDuration,
        exceptionMessage: e.exception_message,
        stackTrace: e.stack_trace,
        machineName: e.device,
        ipAddress: e.ip_address,
        osVersion: e.os_version ?? metaOs,
        appVersion: e.app_version,
        threadId: e.thread_id,
        createdBy: program.program_name.slice(0, 100),
      };
      return { category: (e.category ?? fallback) as LogCategory, log };
    });

    // 4) Simpan.
    try {
      const received = await this.logs.insertMany(items);
      return { ok: true, received };
    } catch (err) {
      console.error("[ingest-logs] gagal menyimpan log:", err);
      return { ok: false, code: "storage_failed", error: "Gagal menyimpan log." };
    }
  }
}
