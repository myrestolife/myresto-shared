/**
 * Health check utilities for MyResto apps.
 *
 * Usage in your app's API routes:
 * ```ts
 * import { checkHealth } from '@myresto/shared/lib/health';
 *
 * export async function GET() {
 *   const result = await checkHealth();
 *   return Response.json(result, { status: result.healthy ? 200 : 503 });
 * }
 * ```
 */

export interface HealthCheckResult {
  healthy: boolean;
  timestamp: string;
  checks: Record<string, { status: "ok" | "error"; durationMs: number; error?: string }>;
}

export interface HealthCheckFn {
  name: string;
  check: () => Promise<void>;
}

/**
 * Run a set of health checks and return a structured result.
 * Checks run in parallel. Overall status is healthy only if all pass.
 */
export async function checkHealth(
  checks: HealthCheckFn[] = []
): Promise<HealthCheckResult> {
  const results: HealthCheckResult["checks"] = {};

  await Promise.all(
    checks.map(async ({ name, check }) => {
      const start = Date.now();
      try {
        await check();
        results[name] = { status: "ok", durationMs: Date.now() - start };
      } catch (err) {
        results[name] = {
          status: "error",
          durationMs: Date.now() - start,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  return {
    healthy: Object.values(results).every((r) => r.status === "ok"),
    timestamp: new Date().toISOString(),
    checks: results,
  };
}

/**
 * Create a Supabase connectivity check for use with checkHealth.
 */
export function createSupabaseCheck(getClient: () => { from: (table: string) => { select: (col: string) => { limit: (n: number) => Promise<{ error: unknown }> } } }): HealthCheckFn {
  return {
    name: "supabase",
    check: async () => {
      const { error } = await getClient().from("_health").select("1").limit(1);
      if (error) throw error;
    },
  };
}
