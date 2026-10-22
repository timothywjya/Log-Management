import type { LogEntry, LogFilter } from "@/domain/log/log-entry";
import type { LogCategory, LogLevel } from "@/domain/log/log-category";
import { canSeeAllPrograms, type AccessUser } from "@/domain/policies/permissions";
import type { LogRepository } from "@/application/ports/log.repository";
import type { ProgramRepository } from "@/application/ports/program.repository";

export const LOG_PAGE_SIZE = 25;

export type LogQuery = {
  category: LogCategory;
  query?: string;
  level?: LogLevel;
  programId?: number;
  from?: Date;
  to?: Date;
  page: number;
};

export type LogPage = {
  canSeeAll: boolean;
  programs: { id: number; program_name: string }[];
  programNames: Map<string, string>;
  logs: LogEntry[];
  total: number;
  totalPages: number;
  page: number;
  byLevel24h: Partial<Record<LogLevel, number>>;
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

export class QueryLogs {
  constructor(
    private readonly logs: LogRepository,
    private readonly programs: ProgramRepository
  ) {}

  async execute(user: AccessUser, q: LogQuery): Promise<LogPage> {
    // Aturan akses sama dengan halaman Program: admin/role tertentu melihat semua,
    // selain itu hanya log dari program milik group-nya. Dicek di QUERY, bukan di UI.
    const canSeeAll = canSeeAllPrograms(user);
    const programs = await this.programs.listNames({ groupId: canSeeAll ? undefined : user.group_id || 0 });

    // Tabel log menyimpan program sebagai teks (*_program_id), bukan relasi.
    const scopeProgramIds = canSeeAll ? null : programs.map((p) => String(p.id));
    const programNames = new Map(programs.map((p) => [String(p.id), p.program_name] as [string, string]));

    const filter: LogFilter = {
      query: q.query,
      level: q.level,
      programId: q.programId,
      scopeProgramIds,
      from: q.from,
      to: q.to,
    };

    const total = await this.logs.count(q.category, filter);
    const totalPages = Math.max(1, Math.ceil(total / LOG_PAGE_SIZE));
    const page = Math.min(Math.max(1, q.page), totalPages);

    const [logs, byLevel24h] = await Promise.all([
      this.logs.find(q.category, filter, { skip: (page - 1) * LOG_PAGE_SIZE, take: LOG_PAGE_SIZE }),
      this.logs.countByLevel(q.category, scopeProgramIds, hoursAgo(24)),
    ]);

    return { canSeeAll, programs, programNames, logs, total, totalPages, page, byLevel24h };
  }
}
