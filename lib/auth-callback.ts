import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export interface AuthCallbackConfig {
  defaultRedirect?: string;
  errorRedirect?: string;
}

export function createAuthCallbackHandler(config?: AuthCallbackConfig) {
  const defaultRedirect = config?.defaultRedirect ?? "/dashboard";
  const errorRedirect = config?.errorRedirect ?? "/sign-in?error=auth_failed";

  return async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const rawNext = searchParams.get("next") ?? defaultRedirect;
    const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : defaultRedirect;

    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : req.nextUrl.origin;

    if (code) {
      const response = NextResponse.redirect(`${origin}${next}`);

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
    }

    return NextResponse.redirect(`${origin}${errorRedirect}`);
  };
}
