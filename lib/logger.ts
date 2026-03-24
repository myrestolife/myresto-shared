/**
 * Structured logging utility for MyResto apps.
 *
 * Usage:
 * ```ts
 * import { createLogger } from '@myresto/shared/lib/logger';
 *
 * const log = createLogger({ name: 'my-app' });
 * log.info('Request handled', { requestId: 'abc', duration: 42 });
 * log.error('Failed to fetch', { error: err, url: '/api/test' });
 * ```
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  name: string;
  message: string;
  [key: string]: unknown;
}

export interface LoggerOptions {
  /** Logger name / service identifier */
  name: string;
  /** Minimum log level (default: "info" in production, "debug" in development) */
  minLevel?: LogLevel;
  /** Custom log handler — defaults to console with JSON in production, pretty in development */
  handler?: (entry: LogEntry) => void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function defaultHandler(entry: LogEntry): void {
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (isDev) {
    const method = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log";
    const { timestamp, level, name, message, ...rest } = entry;
    console[method](`[${timestamp}] ${level.toUpperCase()} (${name}): ${message}`, Object.keys(rest).length ? rest : "");
  } else {
    // Structured JSON for production log aggregators
    console.log(JSON.stringify(entry));
  }
}

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  child(fields: Record<string, unknown>): Logger;
}

export function createLogger(options: LoggerOptions): Logger {
  const {
    name,
    minLevel = (typeof process !== "undefined" && process.env?.NODE_ENV === "development") ? "debug" : "info",
    handler = defaultHandler,
  } = options;

  function shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
  }

  function emit(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!shouldLog(level)) return;
    handler({
      timestamp: new Date().toISOString(),
      level,
      name,
      message,
      ...data,
    });
  }

  const logger: Logger = {
    debug: (msg, data) => emit("debug", msg, data),
    info: (msg, data) => emit("info", msg, data),
    warn: (msg, data) => emit("warn", msg, data),
    error: (msg, data) => emit("error", msg, data),
    child(fields: Record<string, unknown>): Logger {
      return createLogger({
        name,
        minLevel,
        handler: (entry) => handler({ ...fields, ...entry }),
      });
    },
  };

  return logger;
}

/** Shared default logger instance */
export const logger = createLogger({ name: "@myresto/shared" });
