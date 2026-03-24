import { describe, it, expect, vi } from "vitest";
import { createMetrics, noopMetrics } from "../lib/metrics";
import type { MetricEvent } from "../lib/metrics";

describe("createMetrics", () => {
  it("emits counter events on increment", () => {
    const handler = vi.fn();
    const metrics = createMetrics({ onMetric: handler });

    metrics.increment("api.request", { endpoint: "/events" });

    expect(handler).toHaveBeenCalledOnce();
    const event: MetricEvent = handler.mock.calls[0][0];
    expect(event.type).toBe("counter");
    expect(event.name).toBe("api.request");
    expect(event.value).toBe(1);
    expect(event.tags).toEqual({ endpoint: "/events" });
    expect(event.timestamp).toBeTruthy();
  });

  it("supports custom increment value", () => {
    const handler = vi.fn();
    const metrics = createMetrics({ onMetric: handler });

    metrics.increment("api.batch", undefined, 5);

    const event: MetricEvent = handler.mock.calls[0][0];
    expect(event.value).toBe(5);
  });

  it("emits timing events", () => {
    const handler = vi.fn();
    const metrics = createMetrics({ onMetric: handler });

    metrics.timing("api.latency", 42, { endpoint: "/users" });

    const event: MetricEvent = handler.mock.calls[0][0];
    expect(event.type).toBe("timing");
    expect(event.name).toBe("api.latency");
    expect(event.value).toBe(42);
  });

  it("emits gauge events", () => {
    const handler = vi.fn();
    const metrics = createMetrics({ onMetric: handler });

    metrics.gauge("active.connections", 15);

    const event: MetricEvent = handler.mock.calls[0][0];
    expect(event.type).toBe("gauge");
    expect(event.name).toBe("active.connections");
    expect(event.value).toBe(15);
  });

  it("prepends prefix to metric names", () => {
    const handler = vi.fn();
    const metrics = createMetrics({ onMetric: handler, prefix: "myapp" });

    metrics.increment("request");

    const event: MetricEvent = handler.mock.calls[0][0];
    expect(event.name).toBe("myapp.request");
  });
});

describe("noopMetrics", () => {
  it("has all metric methods that do nothing", () => {
    expect(() => noopMetrics.increment("test")).not.toThrow();
    expect(() => noopMetrics.timing("test", 100)).not.toThrow();
    expect(() => noopMetrics.gauge("test", 50)).not.toThrow();
  });
});
