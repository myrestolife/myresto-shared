"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { toClerkUser, getRedirectUrl } from "./helpers";
import type { AuthContextValue } from "./types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue>({
  isLoaded: false,
  isSignedIn: false,
  userId: null,
  session: null,
  user: null,
  getToken: async () => null,
  signOut: async () => {},
});

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getToken = useCallback(async () => {
    return session?.access_token ?? null;
  }, [session]);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setSession(null);
  }, []);

  const user = useMemo(() => (session?.user ? toClerkUser(session.user) : null), [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn: !!session,
      userId: session?.user?.id ?? null,
      session,
      user,
      getToken,
      signOut,
    }),
    [isLoaded, session, user, getToken, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Hook for authentication state — returns isLoaded, isSignedIn, userId, getToken, signOut. */
export function useAuth() {
  const { isLoaded, isSignedIn, getToken, userId, signOut } = useContext(AuthContext);
  return { isLoaded, isSignedIn, getToken, userId, signOut };
}

/** Hook for user profile data — returns user (ClerkCompatibleUser), isSignedIn, isLoaded. */
export function useUser() {
  const { user, isSignedIn, isLoaded } = useContext(AuthContext);
  return { user, isSignedIn, isLoaded };
}

/** Hook for direct Supabase client access. */
export function useSupabase(): SupabaseClient {
  return getSupabase();
}

// ---------------------------------------------------------------------------
// Convenience components
// ---------------------------------------------------------------------------

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

export function SignInButton({ children, mode }: { children?: ReactNode; mode?: string }) {
  return (
    <a href="/sign-in" data-mode={mode}>
      {children ?? "Sign in"}
    </a>
  );
}

export function SignOutButton({ children }: { children?: ReactNode }) {
  const { signOut } = useAuth();
  return (
    <button onClick={() => signOut()} type="button">
      {children ?? "Sign out"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------

export async function forgotPassword(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl("/reset-password"),
  });
  if (error) throw error;
}
