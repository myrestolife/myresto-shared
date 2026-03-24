import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SignIn } from "../lib/auth/SignIn";

// Mock supabase
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock("../lib/auth/supabase", () => ({
  getSupabase: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  })),
  resetSupabase: vi.fn(),
}));

describe("SignIn interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: { provider: "google", url: "" }, error: null });
  });

  it("submits email and password to supabase", async () => {
    render(<SignIn />);

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secret123",
      });
    });
  });

  it("shows error message on failed sign in", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: new Error("Invalid credentials"),
    });

    render(<SignIn />);

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
    });
  });

  it("switches to forgot password mode", () => {
    render(<SignIn />);

    fireEvent.click(screen.getByText("Forgot password?"));
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
  });

  it("goes back from forgot password mode", () => {
    render(<SignIn />);

    fireEvent.click(screen.getByText("Forgot password?"));
    expect(screen.getByText("Reset Password")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Back to sign in"));
    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
  });

  it("calls OAuth on Google button click", async () => {
    render(<SignIn />);

    fireEvent.click(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });
  });

  it("shows loading state during submission", async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 100))
    );

    render(<SignIn />);

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Signing in...")).toBeInTheDocument();
  });
});
