/**
 * In-memory rate limiter.
 * The store is behind a simple interface so it can be swapped for Redis/shared
 * storage later without touching the calling code.
 */

interface RateLimitStore {
  /** Returns true if the caller should be allowed through. */
  check(key: string): boolean;
}

/** Simple sliding-window counter stored in a Map. */
function createMemoryStore(
  maxRequests: number,
  windowMs: number,
): RateLimitStore {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = hits.get(key);

      if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (entry.count < maxRequests) {
        entry.count += 1;
        return true;
      }

      return false;
    },
  };
}

/**
 * Default limiter: 10 requests per 60 seconds per key.
 * Exported so the route handler can use it directly.
 */
export const lookupLimiter = createMemoryStore(10, 60_000);
