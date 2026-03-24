import { describe, it, expect, vi } from "vitest";
import { checkHealth, createSupabaseCheck } from "../lib/health";

describe("checkHealth", () => {
  it("returns healthy with no checks", async () => {
    const result = await checkHealth();
    expect(result.healthy).toBe(true);
    expect(result.timestamp).toBeTruthy();
    expect(result.checks).toEqual({});
  });

  it("returns healthy when all checks pass", async () => {
    const result = await checkHealth([
      { name: "db", check: async () => {} },
      { name: "cache", check: async () => {} },
    ]);
    expect(result.healthy).toBe(true);
    expect(result.checks.db.status).toBe("ok");
    expect(result.checks.cache.status).toBe("ok");
    expect(result.checks.db.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns unhealthy when a check fails", async () => {
    const result = await checkHealth([
      { name: "db", check: async () => { throw new Error("connection refused"); } },
      { name: "cache", check: async () => {} },
    ]);
    expect(result.healthy).toBe(false);
    expect(result.checks.db.status).toBe("error");
    expect(result.checks.db.error).toBe("connection refused");
    expect(result.checks.cache.status).toBe("ok");
  });

  it("runs checks in parallel", async () => {
    const order: string[] = [];
    const result = await checkHealth([
      {
        name: "slow",
        check: async () => {
          await new Promise((r) => setTimeout(r, 50));
          order.push("slow");
        },
      },
      {
        name: "fast",
        check: async () => {
          order.push("fast");
        },
      },
    ]);
    expect(result.healthy).toBe(true);
    expect(order[0]).toBe("fast");
  });
});

describe("createSupabaseCheck", () => {
  it("succeeds when query returns no error", async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(async () => ({ error: null })),
        })),
      })),
    };

    const check = createSupabaseCheck(() => mockClient);
    await expect(check.check()).resolves.toBeUndefined();
    expect(check.name).toBe("supabase");
  });

  it("throws when query returns an error", async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(async () => ({ error: new Error("connection failed") })),
        })),
      })),
    };

    const check = createSupabaseCheck(() => mockClient);
    await expect(check.check()).rejects.toThrow("connection failed");
  });
});
