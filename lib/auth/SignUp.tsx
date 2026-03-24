"use client";

import React, { useState, useId } from "react";
import { getSupabase } from "./supabase";
import { getErrorMessage, getRedirectUrl } from "./helpers";
import {
  AUTH_BOX,
  AUTH_HEADING,
  AUTH_INPUT,
  AUTH_BTN,
  AUTH_ERROR,
  AUTH_MUTED,
} from "./styles";

export function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side password strength check
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter and one number");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: getRedirectUrl("/auth/callback"),
        },
      });
      if (err) throw err;
      setConfirmSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <div className={AUTH_BOX}>
        <h2 className={AUTH_HEADING}>Check Your Email</h2>
        <p className={AUTH_MUTED}>
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className={AUTH_BOX}>
      <h2 className={AUTH_HEADING}>Create Account</h2>
      <form onSubmit={handleSignUp}>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor={firstNameId} className="sr-only">
              First name
            </label>
            <input
              id={firstNameId}
              className={AUTH_INPUT}
              type="text"
              placeholder="First name"
              aria-label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor={lastNameId} className="sr-only">
              Last name
            </label>
            <input
              id={lastNameId}
              className={AUTH_INPUT}
              type="text"
              placeholder="Last name"
              aria-label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
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
          placeholder="Password (min 8 chars, 1 uppercase, 1 number)"
          aria-label="Password"
          aria-describedby={`${passwordId}-hint`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <p id={`${passwordId}-hint`} className="text-[11px] text-[var(--color-text-subtle)] -mt-1 mb-3">
          Min 8 characters, 1 uppercase letter, 1 number
        </p>
        {error && (
          <p className={AUTH_ERROR} role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <button className={AUTH_BTN} type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className={`${AUTH_MUTED} mt-3`}>
        Already have an account?{" "}
        <a href="/sign-in" className="text-[var(--color-accent)] hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
