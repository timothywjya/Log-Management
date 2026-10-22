import type { LogCategory, LogLevel } from "@/domain/log/log-category";
import type { LogEntry, LogFilter, NewLog } from "@/domain/log/log-entry";

export interface LogRepository {
  count(category: LogCategory, filter: LogFilter): Promise<number>;
  find(category: LogCategory, filter: LogFilter, page: { skip: number; take: number }): Promise<LogEntry[]>;
  /** Jumlah log per level sejak `since`, mis. { error: 3, info: 40 }. */
  countByLevel(
    category: LogCategory,
    scopeProgramIds: string[] | null,
    since: Date
  ): Promise<Partial<Record<LogLevel, number>>>;
  /**
   * Simpan log ke tabel sesuai kategori. Baris yang bentrok dengan unique key dedup
   * dilewati. Mengembalikan jumlah baris yang benar-benar baru.
   */
  insertMany(items: { category: LogCategory; log: NewLog }[]): Promise<number>;
}
