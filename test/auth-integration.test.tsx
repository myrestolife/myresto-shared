import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const testSession = {
  access_token: "test-token",
  user: {
    id: "user-1",
    email: "test@test.com",
    user_metadata: { first_name: "Alice", last_name: "Smith" },
    app_metadata: { role: "admin", plan: "pro" },
  },
};

const mockUnsubscribe = vi.fn();

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: testSession },
      error: null,
    }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: testSession, user: testSession.user },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { provider: "google", url: "" },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { session: testSession, user: testSession.user },
      error: null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
  },
};

vi.mock("../lib/auth/supabase", () => ({
  getSupabase: vi.fn(() => mockSupabase),
  resetSupabase: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports under test (must come after vi.mock)
// ---------------------------------------------------------------------------

import {
  AuthProvider,
  useAuth,
  useUser,
  SignIn,
  SignUp,
} from "../lib/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flush all pending microtasks / state updates. */
async function flushEffects() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Auth integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default "signed-in" mock
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: testSession },
      error: null,
    });
  });

  // -----------------------------------------------------------------------
  // AuthProvider + useAuth + useUser
  // -----------------------------------------------------------------------

  describe("AuthProvider + useAuth + useUser", () => {
    it("renders children", async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Hello</div>
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByTestId("child")).toHaveTextContent("Hello");
    });

    it("useAuth returns signed-in state when session exists", async () => {
      function TestComponent() {
        const { isSignedIn, userId, isLoaded } = useAuth();
        return (
          <div>
            <span data-testid="loaded">{String(isLoaded)}</span>
            <span data-testid="signed-in">{String(isSignedIn)}</span>
            <span data-testid="user-id">{userId}</span>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByTestId("loaded")).toHaveTextContent("true");
      expect(screen.getByTestId("signed-in")).toHaveTextContent("true");
      expect(screen.getByTestId("user-id")).toHaveTextContent("user-1");
    });

    it("useUser returns user profile", async () => {
      function TestComponent() {
        const { user, isSignedIn } = useUser();
        if (!user) return <div data-testid="loading">Loading...</div>;
        return (
          <div>
            <span data-testid="full-name">{user.fullName}</span>
            <span data-testid="email">{user.primaryEmailAddress}</span>
            <span data-testid="first-name">{user.firstName}</span>
            <span data-testid="last-name">{user.lastName}</span>
            <span data-testid="role">{user.publicMetadata.role}</span>
            <span data-testid="plan">{user.publicMetadata.plan}</span>
            <span data-testid="signed-in">{String(isSignedIn)}</span>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByTestId("full-name")).toHaveTextContent("Alice Smith");
      expect(screen.getByTestId("email")).toHaveTextContent("test@test.com");
      expect(screen.getByTestId("first-name")).toHaveTextContent("Alice");
      expect(screen.getByTestId("last-name")).toHaveTextContent("Smith");
      expect(screen.getByTestId("role")).toHaveTextContent("admin");
      expect(screen.getByTestId("plan")).toHaveTextContent("pro");
      expect(screen.getByTestId("signed-in")).toHaveTextContent("true");
    });

    it("useAuth.getToken returns access_token", async () => {
      let tokenResult: string | null = null;

      function TestComponent() {
        const { getToken, isLoaded } = useAuth();

        React.useEffect(() => {
          if (isLoaded) {
            getToken().then((t) => {
              tokenResult = t;
            });
          }
        }, [isLoaded, getToken]);

        return <div data-testid="loaded">{String(isLoaded)}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByTestId("loaded")).toHaveTextContent("true");
      expect(tokenResult).toBe("test-token");
    });

    it("shows signed-out state when no session", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      function TestComponent() {
        const { isSignedIn, isLoaded, userId } = useAuth();
        return (
          <div>
            <span data-testid="loaded">{String(isLoaded)}</span>
            <span data-testid="signed-in">{String(isSignedIn)}</span>
            <span data-testid="user-id">{userId ?? "none"}</span>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByTestId("loaded")).toHaveTextContent("true");
      expect(screen.getByTestId("signed-in")).toHaveTextContent("false");
      expect(screen.getByTestId("user-id")).toHaveTextContent("none");
    });
  });

  // -----------------------------------------------------------------------
  // SignIn component
  // -----------------------------------------------------------------------

  describe("SignIn component", () => {
    it("renders email and password inputs", async () => {
      render(
        <AuthProvider>
          <SignIn />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders the Sign In button", async () => {
      render(
        <AuthProvider>
          <SignIn />
        </AuthProvider>,
      );

      await flushEffects();

      expect(
        screen.getByRole("button", { name: "Sign In" }),
      ).toBeInTheDocument();
    });

    it("renders a Forgot password? link", async () => {
      render(
        <AuthProvider>
          <SignIn />
        </AuthProvider>,
      );

      await flushEffects();

      expect(
        screen.getByRole("button", { name: /forgot password/i }),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // SignUp component
  // -----------------------------------------------------------------------

  describe("SignUp component", () => {
    it("renders first name, last name, email, and password inputs", async () => {
      render(
        <AuthProvider>
          <SignUp />
        </AuthProvider>,
      );

      await flushEffects();

      expect(screen.getByLabelText("First name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders the Sign Up button", async () => {
      render(
        <AuthProvider>
          <SignUp />
        </AuthProvider>,
      );

      await flushEffects();

      expect(
        screen.getByRole("button", { name: "Sign Up" }),
      ).toBeInTheDocument();
    });

    it("renders password hint text", async () => {
      render(
        <AuthProvider>
          <SignUp />
        </AuthProvider>,
      );

      await flushEffects();

      expect(
        screen.getByText(/min 8 characters, 1 uppercase letter, 1 number/i),
      ).toBeInTheDocument();
    });
  });
});
