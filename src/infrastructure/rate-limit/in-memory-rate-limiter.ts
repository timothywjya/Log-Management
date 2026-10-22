import type { RateLimiter, RateLimitResult } from "@/application/ports/rate-limiter";

/**
 * Pembatas sederhana (fixed window) yang disimpan di memori proses: cukup untuk satu
 * instance. Jika dijalankan di banyak instance, ganti dengan implementasi Redis/database
 * (cukup buat class baru yang memenuhi RateLimiter, lalu ganti di container.ts).
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly usage = new Map<string | number, { windowStart: number; count: number }>();

  constructor(
    private readonly windowMs = 60_000,
    private readonly maxPerWindow = 1_000
  ) {}

  consume(key: string | number, amount: number): RateLimitResult {
    const now = Date.now();
    const current = this.usage.get(key);

    if (!current || now - current.windowStart >= this.windowMs) {
      this.usage.set(key, { windowStart: now, count: amount });
      return { ok: true };
    }
    if (current.count + amount > this.maxPerWindow) {
      return { ok: false, retryAfter: Math.ceil((current.windowStart + this.windowMs - now) / 1000) };
    }
    current.count += amount;
    return { ok: true };
  }
}
