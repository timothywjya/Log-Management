import { CATEGORY_META, type ColumnSource, type LogCategory } from "@/lib/log-category";
import type { LogEntry } from "@/lib/log-store";
import LogRow, { type LogRowData } from "./LogRow";

const timeFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function cellValue(log: LogEntry, source: ColumnSource): string {
  switch (source) {
    case "module":
      return log.module;
    case "form":
      return log.form;
    case "station":
      return log.station;
    case "duration":
      return log.durationMs;
    case "device":
      return log.device;
    case "app_version":
      return log.appVersion;
    case "os":
      return log.os;
    case "branch":
      return log.branch;
    case "store":
      return log.store;
  }
}

function toJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && Object.keys(value as object).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

function toRow(log: LogEntry, category: LogCategory, programNames: Map<string, string>): LogRowData {
  const columns = CATEGORY_META[category].columns;
  return {
    id: log.id,
    time: `${timeFormat.format(log.time)} WIB`,
    level: log.level,
    program: programNames.get(log.programId) ?? log.programId,
    application: log.application,
    method: log.method,
    user: log.user,
    cells: columns.map((c) => cellValue(log, c.source)),
    message: log.message,
    exception: log.exception,
    stackTrace: log.stackTrace,
    argsJson: toJson(log.args),
    returnJson: toJson(log.returnValue),
    details: [
      { label: "ID", value: log.id },
      { label: "Module", value: log.module },
      { label: "Form", value: log.form },
      { label: "Station / Device", value: log.station },
      { label: "Mesin / Perangkat", value: log.device },
      { label: "Cabang", value: log.branch },
      { label: "Toko", value: log.store },
      { label: "No. Transaksi", value: log.transactionNo },
      { label: "Correlation ID", value: log.correlationId },
      { label: "Durasi (ms)", value: log.durationMs },
      { label: "OS", value: log.os },
      { label: "Versi", value: log.appVersion },
      { label: "IP", value: log.ip },
      { label: "Thread", value: log.threadId },
    ],
  };
}

export default function LogTable({
  logs,
  category,
  programNames,
}: {
  logs: LogEntry[];
  category: LogCategory;
  programNames: Map<string, string>;
}) {
  const columns = CATEGORY_META[category].columns;
  const colSpan = 7 + columns.length; // chevron, waktu, level, program, aplikasi, method, ...kolom kategori, user

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <tr>
            <th className="p-4 pl-5 w-8" />
            <th className="p-4">Waktu</th>
            <th className="p-4">Level</th>
            <th className="p-4">Program</th>
            <th className="p-4">Aplikasi</th>
            <th className="p-4">Method</th>
            {columns.map((c) => (
              <th key={c.label} className="p-4">
                {c.label}
              </th>
            ))}
            <th className="p-4">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <LogRow key={log.id} row={toRow(log, category, programNames)} colSpan={colSpan} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
