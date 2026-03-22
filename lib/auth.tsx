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
import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase singleton (SSR-safe)
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window === "undefined") {
      // SSR without env vars — return a stub
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

// ---------------------------------------------------------------------------
// Auth context types
// ---------------------------------------------------------------------------

interface PublicMetadata {
  role?: string;
  plan?: string;
  [key: string]: unknown;
}

interface ClerkCompatibleUser {
  id: string;
  primaryEmailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  username: string | null;
  publicMetadata: PublicMetadata;
}

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  session: Session | null;
  user: ClerkCompatibleUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

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
// Helpers
// ---------------------------------------------------------------------------

function toClerkUser(user: User): ClerkCompatibleUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const firstName = (meta.first_name ?? meta.name ?? null) as string | null;
  const lastName = (meta.last_name ?? null) as string | null;
  return {
    id: user.id,
    primaryEmailAddress: user.email ?? null,
    firstName,
    lastName,
    fullName: firstName && lastName ? `${firstName} ${lastName}` : firstName ?? lastName ?? null,
    imageUrl: (meta.avatar_url ?? meta.picture ?? null) as string | null,
    username: (meta.preferred_username ?? null) as string | null,
    publicMetadata: {
      role: appMeta.role as string | undefined,
      plan: appMeta.plan as string | undefined,
      ...appMeta,
    },
  };
}

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

export function useAuth() {
  const { isLoaded, isSignedIn, getToken, userId, signOut } = useContext(AuthContext);
  return { isLoaded, isSignedIn, getToken, userId, signOut };
}

export function useUser() {
  const { user, isSignedIn, isLoaded } = useContext(AuthContext);
  return { user, isSignedIn, isLoaded };
}

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
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// SignIn component
// ---------------------------------------------------------------------------

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined },
    });
    if (err) setError(err.message);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setForgotSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const boxStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: "0 auto",
    padding: 32,
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--color-bg-primary)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text-primary)",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 0",
    background: "var(--color-accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };

  if (forgotMode) {
    return (
      <div style={boxStyle}>
        <h2 style={{ color: "var(--color-text-primary)", marginBottom: 16, fontSize: 20, textAlign: "center" }}>
          Reset Password
        </h2>
        {forgotSent ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={handleForgot}>
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button style={btnStyle} type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <p style={{ textAlign: "center", marginTop: 12 }}>
          <button
            type="button"
            onClick={() => { setForgotMode(false); setForgotSent(false); setError(null); }}
            style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: 13 }}
          >
            Back to sign in
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <h2 style={{ color: "var(--color-text-primary)", marginBottom: 16, fontSize: 20, textAlign: "center" }}>
        Sign In
      </h2>
      <form onSubmit={handleSignIn}>
        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div style={{ textAlign: "center", margin: "16px 0", color: "var(--color-text-subtle)", fontSize: 13 }}>or</div>
      <button
        type="button"
        onClick={handleGoogle}
        style={{ ...btnStyle, background: "var(--color-bg-primary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}
      >
        Continue with Google
      </button>
      <p style={{ textAlign: "center", marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setForgotMode(true)}
          style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: 13 }}
        >
          Forgot password?
        </button>
      </p>
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
        Don&apos;t have an account? <a href="/sign-up" style={{ color: "var(--color-accent)" }}>Sign up</a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignUp component
// ---------------------------------------------------------------------------

export function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (err) throw err;
      setConfirmSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const boxStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: "0 auto",
    padding: 32,
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--color-bg-primary)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text-primary)",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 0",
    background: "var(--color-accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };

  if (confirmSent) {
    return (
      <div style={boxStyle}>
        <h2 style={{ color: "var(--color-text-primary)", marginBottom: 16, fontSize: 20, textAlign: "center" }}>
          Check Your Email
        </h2>
        <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <h2 style={{ color: "var(--color-text-primary)", marginBottom: 16, fontSize: 20, textAlign: "center" }}>
        Create Account
      </h2>
      <form onSubmit={handleSignUp}>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={inputStyle} type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input style={inputStyle} type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--color-text-muted)" }}>
        Already have an account? <a href="/sign-in" style={{ color: "var(--color-accent)" }}>Sign in</a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UserButton component
// ---------------------------------------------------------------------------

export function UserButton() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isSignedIn || !user) return null;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid var(--color-border)",
          cursor: "pointer",
          background: "var(--color-bg-elevated)",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-primary)",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            minWidth: 220,
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            padding: 16,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          }}
        >
          <p style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>
            {user.fullName ?? "User"}
          </p>
          {user.primaryEmailAddress && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 8px" }}>
              {user.primaryEmailAddress}
            </p>
          )}
          {user.publicMetadata.plan && (
            <p style={{ color: "var(--color-accent)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", margin: "0 0 12px" }}>
              {user.publicMetadata.plan}
            </p>
          )}
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />
          <button
            type="button"
            onClick={() => { setOpen(false); signOut(); }}
            style={{
              width: "100%",
              padding: "8px 0",
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
