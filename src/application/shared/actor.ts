import type { AccessUser } from "@/domain/policies/permissions";

/** User yang sedang melakukan aksi (diambil dari sesi, bukan dari input client). */
export type Actor = AccessUser & { id: number };
