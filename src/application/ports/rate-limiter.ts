export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export interface RateLimiter {
  /** Mencatat `amount` pemakaian untuk `key`; menolak jika melebihi batas jendela waktu. */
  consume(key: string | number, amount: number): RateLimitResult;
}
