"use client";

import React, { useState, useId } from "react";
import { getSupabase } from "./supabase";
import { forgotPassword } from "./provider";
import { getErrorMessage, getRedirectUrl } from "./helpers";
import {
  AUTH_BOX,
  AUTH_HEADING,
  AUTH_INPUT,
  AUTH_BTN,
  AUTH_BTN_SECONDARY,
  AUTH_ERROR,
  AUTH_LINK,
  AUTH_MUTED,
} from "./styles";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ForgotPasswordForm (internal)
// ---------------------------------------------------------------------------

function ForgotPasswordForm({
  onBack,
}: {
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const emailId = useId();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send reset email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={AUTH_BOX}>
      <h2 className={AUTH_HEADING}>Reset Password</h2>
      {sent ? (
        <p className={AUTH_MUTED}>Check your email for a reset link.</p>
      ) : (
        <form onSubmit={handleForgot}>
          <label htmlFor={emailId} className="sr-only">
            Email
          </label>
          <input
            id={emailId}
            className={AUTH_INPUT}
            type="email"
            placeholder="Email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p className={AUTH_ERROR} role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <button className={AUTH_BTN} type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
      <p className="text-center mt-3">
        <button type="button" onClick={onBack} className={AUTH_LINK}>
          Back to sign in
        </button>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignIn
// ---------------------------------------------------------------------------

export function SignIn({
  afterSignInUrl = "/dashboard",
  redirectUrl,
}: {
  routing?: string;
  path?: string;
  afterSignInUrl?: string;
  redirectUrl?: string;
  appearance?: unknown;
} = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const dest = afterSignInUrl || redirectUrl || "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithPassword({ email, password });
      if (err) throw err;
      // Hard redirect after successful sign-in
      window.location.href = dest;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Sign in failed"));
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(dest)}`;
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (err) setError(err.message);
  };

  if (forgotMode) {
    return (
      <ForgotPasswordForm
        onBack={() => setForgotMode(false)}
      />
    );
  }

  return (
    <div className={AUTH_BOX}>
      <h2 className={AUTH_HEADING}>Sign In</h2>
      <button type="button" onClick={handleGoogle} className={AUTH_BTN_SECONDARY} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <GoogleLogo />
        Continue with Google
      </button>
      <div className="text-center my-4 text-[var(--color-text-subtle)] text-[13px]">or</div>
      <form onSubmit={handleSignIn}>
        <label htmlFor={emailId} className="sr-only">
          Email
        </label>
        <input
          id={emailId}
          className={AUTH_INPUT}
          type="email"
          placeholder="Email"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor={passwordId} className="sr-only">
          Password
        </label>
        <input
          id={passwordId}
          className={AUTH_INPUT}
          type="password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className={AUTH_ERROR} role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <button className={AUTH_BTN} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-center mt-3">
        <button type="button" onClick={() => setForgotMode(true)} className={AUTH_LINK}>
          Forgot password?
        </button>
      </p>
      <p className={`${AUTH_MUTED} mt-2`}>
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="text-[var(--color-accent)] hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
