import type { LogLevel } from "./log-category";

/** Satu baris log yang sudah dinormalisasi, lintas keempat kategori. */
export type LogEntry = {
  id: string;
  time: Date;
  level: LogLevel;
  programId: string;
  application: string;
  module: string;
  form: string;
  method: string;
  user: string;
  station: string;
  device: string;
  branch: string;
  store: string;
  transactionNo: string;
  correlationId: string;
  message: string;
  exception: string;
  stackTrace: string;
  args: unknown;
  returnValue: unknown;
  durationMs: string;
  ip: string;
  os: string;
  appVersion: string;
  threadId: string;
};

/** Data siap simpan untuk satu log baru. */
export type NewLog = {
  occurredAt: Date;
  level: LogLevel;
  correlationId?: string;
  application: string;
  module?: string;
  formName?: string;
  methodName?: string;
  userId?: string;
  stationId?: string;
  deviceId?: string;
  deviceType?: string;
  deviceMerk?: string;
  branchCode?: string;
  storeCode?: string;
  transactionNo?: string;
  programId: string;
  message?: string;
  methodArguments?: Record<string, unknown>;
  returnValue?: unknown;
  executionTimeMs?: number;
  exceptionMessage?: string;
  stackTrace?: string;
  machineName?: string;
  ipAddress?: string;
  osVersion?: string;
  appVersion?: string;
  threadId?: string;
  createdBy: string;
};

export type LogFilter = {
  query?: string;
  level?: LogLevel;
  /** program yang dipilih di dropdown */
  programId?: number;
  /** batas akses: id program yang boleh dilihat. null = semua program. */
  scopeProgramIds: string[] | null;
  from?: Date;
  to?: Date;
};
