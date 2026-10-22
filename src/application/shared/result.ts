/** Hasil use case yang gagal dengan alasan yang boleh ditampilkan ke user. */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

export const UNAUTHORIZED = { ok: false, error: "Sesi tidak valid. Silakan login ulang." } as const;
export const FORBIDDEN = { ok: false, error: "Anda tidak memiliki akses untuk aksi ini." } as const;

export const fail = (error: string) => ({ ok: false as const, error });
