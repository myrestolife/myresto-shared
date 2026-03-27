/**
 * Shared security headers middleware for Next.js apps.
 *
 * Usage in your app's middleware.ts:
 * ```ts
 * import { withSecurityHeaders } from '@myresto/shared/lib/security-headers';
 *
 * export function middleware(request: NextRequest) {
 *   return withSecurityHeaders(request);
 * }
 * ```
 */

import { type NextRequest, NextResponse } from "next/server";

export interface SecurityHeadersConfig {
  /** Content-Security-Policy directive (default: strict self-only policy) */
  csp?: string;
  /** Whether to enable HSTS (default: true) */
  hsts?: boolean;
  /** Custom additional headers */
  extraHeaders?: Record<string, string>;
}

const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
].join("; ");

/**
 * Apply security headers to a Next.js middleware response.
 */
export function withSecurityHeaders(
  request: NextRequest,
  config?: SecurityHeadersConfig
): NextResponse {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  response.headers.set(
    "Content-Security-Policy",
    config?.csp ?? DEFAULT_CSP
  );

  if (config?.hsts !== false) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  if (config?.extraHeaders) {
    for (const [key, value] of Object.entries(config.extraHeaders)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

/**
 * Get security headers as a plain object (for use in next.config.ts headers config).
 */
export function getSecurityHeaders(config?: SecurityHeadersConfig): Array<{ key: string; value: string }> {
  const headers: Array<{ key: string; value: string }> = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-XSS-Protection", value: "1; mode=block" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: config?.csp ?? DEFAULT_CSP },
  ];

  if (config?.hsts !== false) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    });
  }

  return headers;
}
