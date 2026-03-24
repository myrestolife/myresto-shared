import { describe, it, expect, vi } from "vitest";
import { createLogger, logger } from "../lib/logger";
import type { LogEntry } from "../lib/logger";

describe("createLogger", () => {
  it("returns a logger with debug, info, warn, and error methods", () => {
    const log = createLogger({ name: "test" });
    expect(typeof log.debug).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
  });

  describe("custom handler", () => {
    it("receives a properly structured LogEntry", () => {
      const handler = vi.fn();
      const log = createLogger({ name: "test-app", handler });

      log.info("hello world");

      expect(handler).toHaveBeenCalledTimes(1);
      const entry: LogEntry = handler.mock.calls[0][0];
      expect(entry).toMatchObject({
        level: "info",
        name: "test-app",
        message: "hello world",
      });
      expect(typeof entry.timestamp).toBe("string");
    });

    it("is called for each log method at the appropriate level", () => {
      const handler = vi.fn();
      const log = createLogger({ name: "t", handler, minLevel: "debug" });

      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(handler).toHaveBeenCalledTimes(4);
      const levels = handler.mock.calls.map((c: unknown[]) => (c[0] as LogEntry).level);
      expect(levels).toEqual(["debug", "info", "warn", "error"]);
    });
  });

  describe("minLevel filtering", () => {
    it('does not emit "debug" when minLevel is "info"', () => {
      const handler = vi.fn();
      const log = createLogger({ name: "t", minLevel: "info", handler });

      log.debug("should be suppressed");
      expect(handler).not.toHaveBeenCalled();
    });

    it('does not emit "info" when minLevel is "warn"', () => {
      const handler = vi.fn();
      const log = createLogger({ name: "t", minLevel: "warn", handler });

      log.info("should be suppressed");
      expect(handler).not.toHaveBeenCalled();
    });

    it('emits "warn" and "error" when minLevel is "warn"', () => {
      const handler = vi.fn();
      const log = createLogger({ name: "t", minLevel: "warn", handler });

      log.warn("w");
      log.error("e");

      expect(handler).toHaveBeenCalledTimes(2);
      const levels = handler.mock.calls.map((c: unknown[]) => (c[0] as LogEntry).level);
      expect(levels).toEqual(["warn", "error"]);
    });

    it('only emits "error" when minLevel is "error"', () => {
      const handler = vi.fn();
      const log = createLogger({ name: "t", minLevel: "error", handler });

      log.debug("no");
      log.info("no");
      log.warn("no");
      log.error("yes");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].level).toBe("error");
    });
  });

  describe("child logger", () => {
    it("merges extra fields into every log entry", () => {
      const handler = vi.fn();
      const log = createLogger({ name: "parent", handler });
      const child = log.child({ requestId: "abc-123" });

      child.info("request started");

      expect(handler).toHaveBeenCalledTimes(1);
      const entry = handler.mock.calls[0][0];
      expect(entry.requestId).toBe("abc-123");
      expect(entry.name).toBe("parent");
      expect(entry.message).toBe("request started");
    });

    it("preserves the parent logger name", () => {
      const handler = vi.fn();
      const log = createLogger({ name: "svc", handler });
      const child = log.child({ module: "db" });

      child.warn("connection lost");

      expect(handler.mock.calls[0][0].name).toBe("svc");
    });

    it("allows multiple levels of child loggers", () => {
      const handler = vi.fn();
      const log = createLogger({ name: "root", handler });
      const child1 = log.child({ a: 1 });
      const child2 = child1.child({ b: 2 });

      child2.error("deep");

      const entry = handler.mock.calls[0][0];
      expect(entry.a).toBe(1);
      expect(entry.b).toBe(2);
      expect(entry.message).toBe("deep");
    });
  });
});

describe("default logger instance", () => {
  it("exists and is a valid logger", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });
});
