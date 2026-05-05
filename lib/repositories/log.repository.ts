/**
 * LOG REPOSITORY
 * Semua query log (API, Web, Desktop, App) + filter untuk reporting.
 */

import prisma from "@/lib/db";
import { PaginationOptions, PaginatedResult } from "./base.repository";

export interface LogFilter {
  programId?: string;
  teamId?: string;
  groupId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

function buildDateFilter(startDate?: Date, endDate?: Date) {
  if (!startDate && !endDate) return undefined;
  return {
    ...(startDate ? { gte: startDate } : {}),
    ...(endDate ? { lte: endDate } : {}),
  };
}

export class LogRepository {
  // ── API Logs ────────────────────────────────────
  async findApiLogs(filter: LogFilter, pagination?: PaginationOptions) {
    const page  = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip  = (page - 1) * limit;

    const where = {
      ...(filter.programId ? { program_id: filter.programId } : {}),
      ...(filter.startDate || filter.endDate
        ? { created_at: buildDateFilter(filter.startDate, filter.endDate) }
        : {}),
      ...(filter.search
        ? { OR: [
            { endpoint: { contains: filter.search, mode: "insensitive" as const } },
            { message:  { contains: filter.search, mode: "insensitive" as const } },
          ]}
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.logApi.findMany({
        where,
        include: { program: { include: { program_group: true } } },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.logApi.count({ where }),
    ]);

    return {
      data, total, page, limit, totalPages: Math.ceil(total / limit),
    } as PaginatedResult<(typeof data)[0]>;
  }

  // ── Web Logs ────────────────────────────────────
  async findWebLogs(filter: LogFilter, pagination?: PaginationOptions) {
    const page  = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip  = (page - 1) * limit;

    const where = {
      ...(filter.programId ? { program_id: filter.programId } : {}),
      ...(filter.startDate || filter.endDate
        ? { created_at: buildDateFilter(filter.startDate, filter.endDate) }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.logWeb.findMany({
        where, include: { program: true }, skip, take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.logWeb.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Desktop Logs ───────────────────────────────
  async findDesktopLogs(filter: LogFilter, pagination?: PaginationOptions) {
    const page  = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip  = (page - 1) * limit;

    const where = {
      ...(filter.programId ? { program_id: filter.programId } : {}),
      ...(filter.startDate || filter.endDate
        ? { created_at: buildDateFilter(filter.startDate, filter.endDate) }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.logDesktop.findMany({
        where, include: { program: true }, skip, take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.logDesktop.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Aggregasi untuk Reporting ──────────────────
  async getLogCountByProgram(filter: LogFilter) {
    const dateFilter = buildDateFilter(filter.startDate, filter.endDate);
    const where = dateFilter ? { created_at: dateFilter } : {};

    const [apiCount, webCount, desktopCount, appCount] = await Promise.all([
      prisma.logApi.groupBy({ by: ["program_id"], where, _count: { _all: true } }),
      prisma.logWeb.groupBy({ by: ["program_id"], where, _count: { _all: true } }),
      prisma.logDesktop.groupBy({ by: ["program_id"], where, _count: { _all: true } }),
      prisma.logApp.groupBy({ by: ["program_id"], where, _count: { _all: true } }),
    ]);

    return { apiCount, webCount, desktopCount, appCount };
  }

  async getMonthlyLogSummary(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    const where = { created_at: { gte: start, lte: end } };

    const [api, web, desktop, app] = await prisma.$transaction([
      prisma.logApi.count({ where }),
      prisma.logWeb.count({ where }),
      prisma.logDesktop.count({ where }),
      prisma.logApp.count({ where }),
    ]);

    return { year, month, api, web, desktop, app, total: api + web + desktop + app };
  }

  async getLogSummaryByTeam(filter: LogFilter) {
    const where = filter.startDate || filter.endDate
      ? { created_at: buildDateFilter(filter.startDate, filter.endDate) }
      : {};

    // Query via program_group relation
    const programs = await prisma.program.findMany({
      where: filter.groupId ? { program_group_id: filter.groupId } : {},
      select: { id: true, program_name: true, program_group: { select: { group_name: true } } },
    });

    const programIds = programs.map((p: any) => p.id);

    const [apiCount, webCount] = await prisma.$transaction([
      prisma.logApi.count({ where: { ...where, program_id: { in: programIds } } }),
      prisma.logWeb.count({ where: { ...where, program_id: { in: programIds } } }),
    ]);

    return { programs, apiCount, webCount };
  }
}

export const logRepository = new LogRepository();
