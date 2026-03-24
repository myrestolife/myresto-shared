/**
 * Base API utilities for MyResto apps
 *
 * Usage in your app:
 * ```ts
 * import { createApiFetch } from '@myresto/shared/lib/api';
 *
 * const apiFetch = createApiFetch('/api');
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

  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
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

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Shared response handler for both fetch variants. */
async function handleResponse<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(
      (body as Record<string, string>).error || `API error ${res.status}`,
      res.status,
      url,
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
): Record<string, string> {
  const headers = { ...base };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  headers["X-Request-Id"] = requestId || generateRequestId();
  return headers;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a typed API fetch function with a base URL.
 */
export function createApiFetch(baseUrl: string = "/api") {
  return async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers = buildHeaders(
      { "Content-Type": "application/json", ...opts.headers },
      opts.token,
      opts.requestId
    );

    const res = await fetch(url, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    return handleResponse<T>(res, url);
  };
}

/**
 * Create a file upload function for binary uploads (images, etc.)
 */
export function createFileUpload(baseUrl: string = "/api") {
  return async function uploadFile<T = { url: string }>(
    path: string,
    file: File,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers = buildHeaders(
      { "Content-Type": file.type, "X-Content-Type": file.type, ...additionalHeaders },
      token
    );

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: file,
    });

    return handleResponse<T>(res, url);
  };
}
