/**
 * Lightweight metrics interface for MyResto apps.
 *
 * Provides a simple API for counting events and recording durations.
 * Consuming apps can plug in their preferred backend (StatsD, Prometheus, Datadog, etc.)
 *
 * Usage:
 * ```ts
 * import { createMetrics } from '@myresto/shared/lib/metrics';
 *
 * const metrics = createMetrics({
 *   onMetric: (metric) => statsd.increment(metric.name, metric.value, metric.tags),
 * });
 *
 * metrics.increment('api.request', { endpoint: '/events' });
 * metrics.timing('api.latency', 42, { endpoint: '/events' });
 * ```
 */

export type MetricType = "counter" | "timing" | "gauge";

export interface MetricEvent {
  type: MetricType;
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: string;
}

export interface MetricsOptions {
  /** Called for every metric event. Wire this to your preferred metrics backend. */
  onMetric: (event: MetricEvent) => void;
  /** Optional prefix prepended to all metric names. */
  prefix?: string;
}

export interface Metrics {
  /** Increment a counter by 1 (or specified amount). */
  increment(name: string, tags?: Record<string, string>, value?: number): void;
  /** Record a timing/duration in milliseconds. */
  timing(name: string, durationMs: number, tags?: Record<string, string>): void;
  /** Set a gauge value. */
  gauge(name: string, value: number, tags?: Record<string, string>): void;
}

export function createMetrics(options: MetricsOptions): Metrics {
  const { onMetric, prefix = "" } = options;

  function emit(type: MetricType, name: string, value: number, tags?: Record<string, string>): void {
    onMetric({
      type,
      name: prefix ? `${prefix}.${name}` : name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    increment: (name, tags, value = 1) => emit("counter", name, value, tags),
    timing: (name, durationMs, tags) => emit("timing", name, durationMs, tags),
    gauge: (name, value, tags) => emit("gauge", name, value, tags),
  };
}

/** No-op metrics that silently discards all events. Useful as a default. */
export const noopMetrics: Metrics = {
  increment: () => {},
  timing: () => {},
  gauge: () => {},
};
