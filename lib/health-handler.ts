import { NextResponse } from "next/server";

export interface HealthCheckDef {
  name: string;
  check: () => Promise<void>;
}

export function createHealthHandler(checks: HealthCheckDef[]) {
  return async function GET(): Promise<NextResponse> {
    const results: Record<string, "ok" | "error"> = {};

    await Promise.all(
      checks.map(async ({ name, check }) => {
        try {
          await check();
          results[name] = "ok";
        } catch {
          results[name] = "error";
        }
      })
    );

    const allOk = Object.values(results).every((v) => v === "ok");

    return NextResponse.json(
      { status: allOk ? "healthy" : "degraded", checks: results },
      { status: allOk ? 200 : 503 }
    );
  };
}
