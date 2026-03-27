/**
 * Factory for a Supabase-aware Next.js middleware function.
 *
 * Usage in your app's `middleware.ts`:
 * ```ts
 * import { createSupabaseMiddleware } from "@myresto/shared/lib/middleware";
 *
 * const handler = createSupabaseMiddleware({
 *   protectedPrefixes: ["/dashboard"],
 *   signInPath: "/sign-in",
 * });
 *
 * export async function middleware(req: NextRequest) {
 *   return handler(req);
 * }
 * ```
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./supabase-server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MiddlewareConfig {
  /** Path prefixes that require authentication (e.g. ["/dashboard"]) */
  protectedPrefixes: string[];
  /** Path to redirect unauthenticated users to (e.g. "/sign-in") */
  signInPath: string;
  /** Search-param name used for the return-to URL (default: "redirect") */
  redirectParam?: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a Next.js middleware function that:
 * 1. Generates / propagates an `x-request-id` header.
 * 2. Creates a Supabase server client with the cookie adapter.
 * 3. Redirects unauthenticated users away from protected prefixes.
 */
export function createSupabaseMiddleware(config: MiddlewareConfig) {
  const { protectedPrefixes, signInPath, redirectParam = "redirect" } = config;

  return async function middleware(req: NextRequest): Promise<NextResponse> {
    const { pathname } = req.nextUrl;
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

    const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

    let response = NextResponse.next({ request: { headers: req.headers } });
    response.headers.set("x-request-id", requestId);

    if (!isProtected) {
      return response;
    }

    // Build Supabase client with cookie adapter
    const supabase = createMiddlewareSupabaseClient(req, response);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = signInPath;
      signInUrl.searchParams.set(redirectParam, pathname);
      return NextResponse.redirect(signInUrl);
    }

    return response;
  };
}
