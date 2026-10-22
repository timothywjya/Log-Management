// Akses ke 4 tabel log (log_web, log_job, log_desktop, log_mobile).
// Nama kolom tiap tabel diawali nama kategori (web_level, job_level, ...), jadi satu
// kode bisa dipakai untuk semuanya.

import type { LogCategory, LogLevel } from "@/domain/log/log-category";
import type { LogEntry, LogFilter, NewLog } from "@/domain/log/log-entry";
import type { LogRepository } from "@/application/ports/log.repository";
import { prisma as db } from "@/infrastructure/prisma/client";

type Row = Record<string, unknown>;

// Delegate Prisma berbeda tipe per tabel; dipersempit ke operasi yang dipakai di sini.
type Delegate = {
  count(args: object): Promise<number>;
  findMany(args: object): Promise<Row[]>;
  groupBy(args: object): Promise<Array<Row & { _count: { _all: number } }>>;
  createMany(args: object): Promise<{ count: number }>;
};

const delegates: Record<LogCategory, Delegate> = {
  web: db.log_web as unknown as Delegate,
  job: db.log_job as unknown as Delegate,
  desktop: db.log_desktop as unknown as Delegate,
  mobile: db.log_mobile as unknown as Delegate,
};

const toDbLevel = (level: LogLevel) => level.toUpperCase();
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

const SEARCH_FIELDS = [
  "application",
  "module",
  "form_name",
  "method_name",
  "user_id",
  "message",
  "exception_message",
  "machine_name",
  "transaction_no",
];

function buildWhere(category: LogCategory, f: LogFilter): Row {
  const p = category;
  const where: Row = {};

  if (f.level) where[`${p}_level`] = toDbLevel(f.level);

  // Kolom *_program_id bertipe teks, jadi id program (angka) dibandingkan sebagai string.
  let ids = f.scopeProgramIds;
  if (f.programId) {
    const wanted = String(f.programId);
    ids = ids && !ids.includes(wanted) ? [] : [wanted];
  }
  if (ids) where[`${p}_program_id`] = { in: ids };

  if (f.from || f.to) {
    where[`${p}_log_date`] = {
      ...(f.from ? { gte: f.from } : {}),
      ...(f.to ? { lte: f.to } : {}),
    };
  }

  if (f.query) {
    const contains = { contains: f.query, mode: "insensitive" as const };
    where.OR = SEARCH_FIELDS.map((field) => ({ [`${p}_${field}`]: contains }));
  }

  return where;
}

function normalize(category: LogCategory, row: Row): LogEntry {
  const p = category;
  const g = (k: string) => row[`${p}_${k}`];
  const isMobile = category === "mobile";

  // Mobile punya device_id/merk/type; kategori lain memakai nama mesin.
  const mobileDevice = [str(g("device_merk")), str(g("device_type"))].filter(Boolean).join(" ");
  const device = isMobile ? mobileDevice || str(g("device_id")) || str(g("machine_name")) : str(g("machine_name"));

  return {
    id: str(g("id")),
    time: g("log_date") as Date,
    level: str(g("level")).toLowerCase() as LogLevel,
    programId: str(g("program_id")),
    application: str(g("application")),
    module: str(g("module")),
    form: str(g("form_name")),
    method: str(g("method_name")),
    user: str(g("user_id")),
    station: isMobile ? str(g("device_id")) : str(g("station_id")),
    device,
    branch: str(g("branch_code")),
    store: str(g("store_code")),
    transactionNo: str(g("transaction_no")),
    correlationId: str(g("correlation_id")),
    message: str(g("message")),
    exception: str(g("exception_message")),
    stackTrace: str(g("stack_trace")),
    args: g("method_arguments") ?? null,
    returnValue: g("return_value") ?? null,
    durationMs: str(g("execution_time_ms")),
    ip: str(g("ip_address")),
    os: str(g("os_version")),
    appVersion: str(g("app_version")),
    threadId: str(g("thread_id")),
  };
}

function toColumns(category: LogCategory, l: NewLog): Row {
  const p = category;
  const cols: Row = {
    log_date: l.occurredAt,
    level: toDbLevel(l.level),
    correlation_id: l.correlationId ?? null,
    application: l.application,
    module: l.module ?? null,
    form_name: l.formName ?? null,
    method_name: l.methodName ?? null,
    user_id: l.userId ?? null,
    branch_code: l.branchCode ?? null,
    store_code: l.storeCode ?? null,
    transaction_no: l.transactionNo ?? null,
    program_id: l.programId,
    message: l.message ?? null,
    method_arguments: l.methodArguments,
    return_value: l.returnValue as object | undefined,
    execution_time_ms: l.executionTimeMs ?? null,
    exception_message: l.exceptionMessage ?? null,
    stack_trace: l.stackTrace ?? null,
    machine_name: l.machineName ?? null,
    ip_address: l.ipAddress ?? null,
    os_version: l.osVersion ?? null,
    app_version: l.appVersion ?? null,
    thread_id: l.threadId ?? null,
    created_by: l.createdBy,
  };

  if (category === "mobile") {
    cols.device_id = l.deviceId ?? null;
    cols.device_type = l.deviceType ?? null;
    cols.device_merk = l.deviceMerk ?? null;
  } else {
    cols.station_id = l.stationId ?? null;
  }

  return Object.fromEntries(
    Object.entries(cols)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [`${p}_${k}`, v])
  );
}

export class PrismaLogRepository implements LogRepository {
  count(category: LogCategory, filter: LogFilter) {
    return delegates[category].count({ where: buildWhere(category, filter) });
  }

  async find(category: LogCategory, filter: LogFilter, page: { skip: number; take: number }) {
    const p = category;
    const rows = await delegates[category].findMany({
      where: buildWhere(category, filter),
      orderBy: [{ [`${p}_log_date`]: "desc" }, { [`${p}_id`]: "desc" }],
      skip: page.skip,
      take: page.take,
    });
    return rows.map((r) => normalize(category, r));
  }

  async countByLevel(category: LogCategory, scopeProgramIds: string[] | null, since: Date) {
    const p = category;
    const rows = await delegates[category].groupBy({
      by: [`${p}_level`],
      where: buildWhere(category, { scopeProgramIds, from: since }),
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [str(r[`${p}_level`]).toLowerCase(), r._count._all])) as Partial<
      Record<LogLevel, number>
    >;
  }

  async insertMany(items: { category: LogCategory; log: NewLog }[]) {
    const byCategory = new Map<LogCategory, Row[]>();
    for (const { category, log } of items) {
      const list = byCategory.get(category) ?? [];
      list.push(toColumns(category, log));
      byCategory.set(category, list);
    }

    let inserted = 0;
    for (const [category, data] of byCategory) {
      const res = await delegates[category].createMany({ data, skipDuplicates: true });
      inserted += res.count;
    }
    return inserted;
  }
}
