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

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Sign in failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectUrl("/auth/callback") },
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
      <div className="text-center my-4 text-[var(--color-text-subtle)] text-[13px]">or</div>
      <button type="button" onClick={handleGoogle} className={AUTH_BTN_SECONDARY}>
        Continue with Google
      </button>
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
