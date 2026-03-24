import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiFetch, ApiError } from "../lib/api";
import { createLogger } from "../lib/logger";
import { createMetrics } from "../lib/metrics";
import type { MetricEvent } from "../lib/metrics";
import type { LogEntry } from "../lib/logger";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Observability integration", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("propagates requestId from API call through to ApiError", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Not found" }, 404));

    const apiFetch = createApiFetch("/api");

    try {
      await apiFetch("/missing", { requestId: "corr-123" });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.requestId).toBe("corr-123");
      expect(apiErr.status).toBe(404);
    }
  });

  it("FetchHooks onRequest receives requestId for correlation", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const onRequest = vi.fn();
    const apiFetch = createApiFetch("/api", { onRequest });

    await apiFetch("/test", { requestId: "req-abc" });

    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: "req-abc", method: "GET", url: "/api/test" })
    );
  });

  it("FetchHooks onResponse includes timing data", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const onResponse = vi.fn();
    const apiFetch = createApiFetch("/api", { onResponse });

    await apiFetch("/test");

    expect(onResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 200,
        url: "/api/test",
        method: "GET",
      })
    );
    expect(onResponse.mock.calls[0][0].durationMs).toBeGreaterThanOrEqual(0);
    expect(onResponse.mock.calls[0][0].requestId).toBeTruthy();
  });

  it("FetchHooks onError receives full ApiError with requestId", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Server error" }, 500));

    const onError = vi.fn();
    const apiFetch = createApiFetch("/api", { onError });

    await expect(apiFetch("/fail", { requestId: "req-err" })).rejects.toThrow();

    expect(onError).toHaveBeenCalledOnce();
    const err = onError.mock.calls[0][0] as ApiError;
    expect(err.requestId).toBe("req-err");
    expect(err.status).toBe(500);
  });

  it("logger + API hooks enable full correlation workflow", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Unauthorized" }, 401));

    const logEntries: LogEntry[] = [];
    const log = createLogger({
      name: "test",
      handler: (entry) => logEntries.push(entry),
    });

    const metricEvents: MetricEvent[] = [];
    const metrics = createMetrics({
      onMetric: (event) => metricEvents.push(event),
    });

    const apiFetch = createApiFetch("/api", {
      onRequest: ({ url, method, requestId }) => {
        log.info("API request", { url, method, requestId });
        metrics.increment("api.request", { method });
      },
      onError: (err) => {
        log.error("API error", { url: err.url, status: err.status, requestId: err.requestId });
        metrics.increment("api.error", { status: String(err.status) });
      },
    });

    try {
      await apiFetch("/protected", { requestId: "corr-full" });
    } catch {
      // expected
    }

    // Verify logger captured correlated entries
    expect(logEntries).toHaveLength(2);
    expect(logEntries[0].message).toBe("API request");
    expect(logEntries[0].requestId).toBe("corr-full");
    expect(logEntries[1].message).toBe("API error");
    expect(logEntries[1].requestId).toBe("corr-full");
    expect(logEntries[1].status).toBe(401);

    // Verify metrics captured events
    expect(metricEvents).toHaveLength(2);
    expect(metricEvents[0].name).toBe("api.request");
    expect(metricEvents[1].name).toBe("api.error");
    expect(metricEvents[1].tags?.status).toBe("401");
  });
});
