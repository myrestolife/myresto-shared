/**
 * Shared Supabase server-client factory for Next.js middleware / route handlers.
 *
 * Both the auth-callback handler and the middleware need to create a Supabase
 * server client wired to the request/response cookie jar. This module
 * centralises that construction so the cookie adapter is defined once.
 */

import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Create a Supabase server client whose cookie adapter reads from `req` and
 * writes to `res`.
 *
 * Intended for use inside Next.js middleware and route handlers where both a
 * `NextRequest` and a `NextResponse` are available.
 */
export function createMiddlewareSupabaseClient(
  req: NextRequest,
  res: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}
