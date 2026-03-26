/**
 * Factory for Upstash-backed rate limiting with configurable tiers.
 *
 * Requires `@upstash/ratelimit` and `@upstash/redis` as peer dependencies —
 * they are NOT bundled.
 *
 * Usage:
 * ```ts
 * import { createRateLimiter } from "@myresto/shared/lib/ratelimit";
 *
 * const limiter = createRateLimiter({
 *   url: process.env.KV_REST_API_URL!,
 *   token: process.env.KV_REST_API_TOKEN!,
 * });
 *
 * const { allowed, headers } = await limiter.check(req, "auth");
 * if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429, headers });
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RateLimitTier = "auth" | "ai" | "form" | "read" | "write" | "sensitive";

export interface RateLimitConfig {
  /** Upstash Redis REST URL */
  url: string;
  /** Upstash Redis REST token */
  token: string;
  /** Override default tier configurations */
  tiers?: Partial<Record<RateLimitTier, { requests: number; window: string }>>;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Rate-limit headers to attach to the response */
  headers: Record<string, string>;
}

export interface RateLimitOptions {
  /**
   * Behaviour when the Redis backend is unavailable.
   * - `false` (default): deny the request (fail-closed).
   * - `true`: allow the request (fail-open, for backward compat with garage).
   */
  allowOnError?: boolean;
}

// ---------------------------------------------------------------------------
// Default tier definitions (matching event's values + sensitive)
// ---------------------------------------------------------------------------

const DEFAULT_TIERS: Record<RateLimitTier, { requests: number; window: string }> = {
  auth: { requests: 10, window: "1m" },
  ai: { requests: 5, window: "1m" },
  form: { requests: 5, window: "1h" },
  read: { requests: 300, window: "1m" },
  write: { requests: 20, window: "1m" },
  sensitive: { requests: 10, window: "1m" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the client IP from standard proxy headers. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a rate limiter backed by Upstash Redis.
 *
 * `@upstash/ratelimit` and `@upstash/redis` are loaded dynamically so they
 * remain optional peer dependencies.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { url, token, tiers: tierOverrides } = config;

  const mergedTiers: Record<RateLimitTier, { requests: number; window: string }> = {
    ...DEFAULT_TIERS,
    ...tierOverrides,
  };

  // Lazy-initialised limiters keyed by tier
  let limiters: Record<string, { limit(id: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> }> | null =
    null;

  async function ensureLimiters(): Promise<void> {
    if (limiters) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    // @ts-expect-error — optional peer dependency; may not be installed at compile time
    const { Ratelimit } = (await import("@upstash/ratelimit")) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    // @ts-expect-error — optional peer dependency; may not be installed at compile time
    const { Redis } = (await import("@upstash/redis")) as any;

    const redis = new Redis({ url, token });

    limiters = {};
    for (const [tier, cfg] of Object.entries(mergedTiers)) {
      limiters[tier] = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window),
        prefix: `rl:${tier}`,
      });
    }
  }

  return {
    /**
     * Check whether a request is within the rate limit for the given tier.
     *
     * @param req       - The incoming request (used to extract client IP).
     * @param tier      - Which rate-limit tier to apply.
     * @param identifier - Optional override for the rate-limit key (defaults to client IP).
     * @param options   - Control fail-open / fail-closed behaviour.
     */
    async check(
      req: Request,
      tier: RateLimitTier,
      identifier?: string,
      options?: RateLimitOptions,
    ): Promise<RateLimitResult> {
      const id = identifier || getClientIp(req);
      const allowOnError = options?.allowOnError ?? false;

      try {
        await ensureLimiters();
        const limiter = limiters![tier];
        if (!limiter) {
          throw new Error(`Unknown rate-limit tier: ${tier}`);
        }

        const { success, limit, remaining, reset } = await limiter.limit(id);

        const headers: Record<string, string> = {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        };

        if (!success) {
          const retryAfter = Math.ceil((reset - Date.now()) / 1000);
          headers["Retry-After"] = String(retryAfter);
        }

        return { allowed: success, headers };
      } catch (err) {
        console.error("Rate limit check failed:", err);
        return { allowed: allowOnError, headers: {} };
      }
    },
  };
}
