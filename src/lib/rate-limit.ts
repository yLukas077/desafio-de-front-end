/**
 * Token-bucket-ish rate limiter for a single Node process. Sufficient for
 * a single instance behind a single domain; for horizontal scaling, swap
 * the Map for Redis/Upstash without changing the interface.
 *
 * Buckets are pruned lazily as keys are checked.
 */

export type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  /** Returns true if allowed; false if over the limit. */
  check(key: string): { allowed: boolean; remaining: number; resetAt: number; retryAfter: number };
  /** Clears state — useful in tests. */
  reset(): void;
};

export function createRateLimiter(opts: { windowMs: number; max: number }): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    check(key) {
      const now = Date.now();
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= now) {
        const resetAt = now + opts.windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: opts.max - 1, resetAt, retryAfter: 0 };
      }
      if (existing.count >= opts.max) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: existing.resetAt,
          retryAfter: Math.ceil((existing.resetAt - now) / 1000),
        };
      }
      existing.count += 1;
      return {
        allowed: true,
        remaining: opts.max - existing.count,
        resetAt: existing.resetAt,
        retryAfter: 0,
      };
    },
    reset() {
      buckets.clear();
    },
  };
}
