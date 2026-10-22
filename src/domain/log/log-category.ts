// Definisi 4 kategori Activity Log. Tiap kategori = 1 tabel: web -> log_web, job -> log_job,
// desktop -> log_desktop, mobile -> log_mobile. Kode murni (tanpa dependensi), aman di server maupun client.

export const LOG_CATEGORIES = ["web", "job", "desktop", "mobile"] as const;
export type LogCategory = (typeof LOG_CATEGORIES)[number];

// Di database level disimpan sebagai enum huruf besar (TRACE, DEBUG, ...).
// Di aplikasi/API dipakai huruf kecil.
export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export function isLogCategory(value: string): value is LogCategory {
  return (LOG_CATEGORIES as readonly string[]).includes(value);
}

export function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVELS as readonly string[]).includes(value);
}

/**
 * Menebak kategori dari NAMA tipe program (tabel program_types), dipakai jika
 * pengirim log tidak menyebut `category`. Sesuaikan kata kuncinya dengan nama
 * tipe program yang ada di database Anda.
 */
export function categoryFromTypeName(name: string | null | undefined): LogCategory | null {
  const n = (name ?? "").toLowerCase();
  if (/(mobile|android|ios)/.test(n)) return "mobile";
  if (/(desktop|windows)/.test(n)) return "desktop";
  if (/(job|batch|scheduler|cron|service)/.test(n)) return "job";
  if (/(web|api)/.test(n)) return "web";
  return null;
}

/** Kolom ekstra yang ditampilkan di tabel (selain waktu, level, program, aplikasi, method, user). */
export type ColumnSource =
  | "module"
  | "form"
  | "station"
  | "duration"
  | "device"
  | "app_version"
  | "os"
  | "branch"
  | "store";

export type CategoryMeta = {
  label: string;
  description: string;
  columns: { label: string; source: ColumnSource }[];
};

export const CATEGORY_META: Record<LogCategory, CategoryMeta> = {
  web: {
    label: "Web",
    description: "Aktivitas aplikasi web (request, login, perubahan data).",
    columns: [
      { label: "Module", source: "module" },
      { label: "Form", source: "form" },
      { label: "Durasi (ms)", source: "duration" },
    ],
  },
  job: {
    label: "Job",
    description: "Eksekusi job, scheduler, dan proses batch.",
    columns: [
      { label: "Module", source: "module" },
      { label: "Station", source: "station" },
      { label: "Durasi (ms)", source: "duration" },
    ],
  },
  desktop: {
    label: "Desktop",
    description: "Aktivitas aplikasi desktop di komputer pengguna.",
    columns: [
      { label: "Mesin", source: "device" },
      { label: "Versi", source: "app_version" },
      { label: "OS", source: "os" },
    ],
  },
  mobile: {
    label: "Mobile",
    description: "Aktivitas aplikasi Android / iOS.",
    columns: [
      { label: "Perangkat", source: "device" },
      { label: "Versi", source: "app_version" },
      { label: "OS", source: "os" },
    ],
  },
};
