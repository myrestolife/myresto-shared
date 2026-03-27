/**
 * Shared auth-callback handler for Next.js apps.
 *
 * Exchanges an OAuth `code` for a Supabase session and redirects the user
 * to the requested path. Validates the `x-forwarded-host` header against
 * the known domain allowlist to prevent open-redirect attacks via header
 * injection.
 *
 * Usage in your app's `app/auth/callback/route.ts`:
 * ```ts
 * import { handleAuthCallback } from '@myresto/shared/lib/auth-callback';
 *
 * export async function GET(req: NextRequest) {
 *   return handleAuthCallback(req);
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { APP_DOMAINS } from "./config";
import { createMiddlewareSupabaseClient } from "./supabase-server";

/** Set of root domains derived from the APP_DOMAINS allowlist. */
const KNOWN_DOMAINS = Object.keys(APP_DOMAINS);

/**
 * Check whether `host` is a known domain (exact match or subdomain of an
 * entry in the allowlist).
 */
function isKnownHost(host: string): boolean {
  return KNOWN_DOMAINS.some(
    (d) => host === d || host.endsWith("." + d),
  );
}

/**
 * Build a validated origin string from the forwarded headers.
 *
 * If the `x-forwarded-host` value is not in the known domain allowlist the
 * function falls back to the request's own origin, preventing an attacker
 * from injecting arbitrary redirect targets.
 */
function getValidatedOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost && isKnownHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return req.nextUrl.origin;
}

export interface AuthCallbackOptions {
  /** Default path to redirect to when no `next` param is provided (default: "/dashboard"). */
  defaultRedirect?: string;
  /** Path to redirect to on auth failure (default: "/sign-in?error=auth_failed"). */
  errorRedirect?: string;
}

/**
 * Handle the Supabase OAuth callback.
 *
 * Reads the `code` search param, exchanges it for a session, and redirects
 * to the `next` search param (or the configured default).
 */
export async function handleAuthCallback(
  req: NextRequest,
  options?: AuthCallbackOptions,
): Promise<NextResponse> {
  const { defaultRedirect = "/dashboard", errorRedirect = "/sign-in?error=auth_failed" } =
    options ?? {};

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? defaultRedirect;
  // Prevent open-redirect via `//evil.com` style paths
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : defaultRedirect;

  const origin = getValidatedOrigin(req);

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createMiddlewareSupabaseClient(req, response);

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}${errorRedirect}`);
}
