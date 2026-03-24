import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

/**
 * Get or create a Supabase client singleton.
 * Accepts an optional factory for dependency injection in tests.
 */
export function getSupabase(factory?: () => SupabaseClient): SupabaseClient {
  if (_supabase) return _supabase;

  if (factory) {
    _supabase = factory();
    return _supabase;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window === "undefined") {
      // SSR without env vars — return a no-op stub
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error("No Supabase config") }),
          signUp: async () => ({ data: { session: null, user: null }, error: new Error("No Supabase config") }),
          signInWithOAuth: async () => ({ data: { provider: "", url: "" }, error: new Error("No Supabase config") }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ data: {}, error: new Error("No Supabase config") }),
        },
        from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }) }) }),
      } as unknown as SupabaseClient;
    }
    throw new Error(
      "@myresto/shared: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

/** Reset the singleton — useful for tests. */
export function resetSupabase(): void {
  _supabase = null;
}
