import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SignUp } from "../lib/auth/SignUp";

const mockSignUp = vi.fn();

vi.mock("../lib/auth/supabase", () => ({
  getSupabase: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  })),
  resetSupabase: vi.fn(),
}));

describe("SignUp interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ data: {}, error: null });
  });

  it("validates password strength before submitting", async () => {
    render(<SignUp />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("validates uppercase requirement", async () => {
    render(<SignUp />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "nouppercase1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("uppercase letter");
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("submits to supabase with valid data", async () => {
    render(<SignUp />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPass1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "alice@test.com",
          password: "StrongPass1",
        })
      );
    });
  });

  it("shows confirmation message after successful sign up", async () => {
    render(<SignUp />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPass1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Check Your Email")).toBeInTheDocument();
    });
  });

  it("shows error on sign up failure", async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: new Error("Email already registered"),
    });

    render(<SignUp />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "taken@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPass1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email already registered");
    });
  });
});
