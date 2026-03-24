/**
 * Base API utilities for MyResto apps
 *
 * Usage in your app:
 * ```ts
 * import { createApiFetch } from '@myresto/shared/lib/api';
 *
 * const apiFetch = createApiFetch('/api', {
 *   onRequest: ({ url, method, requestId }) => console.log('→', method, url),
 *   onError: (err) => Sentry.captureException(err),
 * });
 *
 * export const api = {
 *   getEvents: () => apiFetch<{ events: Event[] }>('/events'),
 *   createEvent: (data, token) => apiFetch('/events', { method: 'POST', body: data, token }),
 * };
 * ```
 */

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: unknown;
  readonly requestId: string;

  constructor(message: string, status: number, url: string, requestId: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.requestId = requestId;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  /** Optional correlation ID; auto-generated if omitted. */
  requestId?: string;
}

/** Instrumentation hooks for observability. */
export interface FetchHooks {
  /** Called before each request is sent. */
  onRequest?: (ctx: { url: string; method: string; requestId: string }) => void;
  /** Called after a successful response. */
  onResponse?: (ctx: { url: string; method: string; requestId: string; status: number; durationMs: number }) => void;
  /** Called when a request fails (network error or non-ok response). */
  onError?: (error: ApiError) => void;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Shared response handler for both fetch variants. */
async function handleResponse<T>(res: Response, url: string, requestId: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(
      (body as Record<string, string>).error || `API error ${res.status}`,
      res.status,
      url,
      requestId,
      body
    );
  }
  return res.json();
}

/** Build common headers with auth + request ID. */
function buildHeaders(
  base: Record<string, string>,
  token?: string | null,
  requestId?: string
): { headers: Record<string, string>; requestId: string } {
  const headers = { ...base };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const id = requestId || generateRequestId();
  headers["X-Request-Id"] = id;
  return { headers, requestId: id };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a typed API fetch function with a base URL and optional instrumentation hooks.
 */
export function createApiFetch(baseUrl: string = "/api", hooks?: FetchHooks) {
  return async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
    const url = `${baseUrl}${path}`;
    const method = opts.method || "GET";
    const { headers, requestId } = buildHeaders(
      { "Content-Type": "application/json", ...opts.headers },
      opts.token,
      opts.requestId
    );

    hooks?.onRequest?.({ url, method, requestId });
    const start = Date.now();

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });

      const result = await handleResponse<T>(res, url, requestId);
      hooks?.onResponse?.({ url, method, requestId, status: res.status, durationMs: Date.now() - start });
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        hooks?.onError?.(err);
      }
      throw err;
    }
  };
}

/**
 * Create a file upload function for binary uploads (images, etc.)
 */
export function createFileUpload(baseUrl: string = "/api", hooks?: FetchHooks) {
  return async function uploadFile<T = { url: string }>(
    path: string,
    file: File,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const { headers, requestId } = buildHeaders(
      { "Content-Type": file.type, "X-Content-Type": file.type, ...additionalHeaders },
      token
    );

    hooks?.onRequest?.({ url, method: "POST", requestId });
    const start = Date.now();

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: file,
      });

      const result = await handleResponse<T>(res, url, requestId);
      hooks?.onResponse?.({ url, method: "POST", requestId, status: res.status, durationMs: Date.now() - start });
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        hooks?.onError?.(err);
      }
      throw err;
    }
  };
}
