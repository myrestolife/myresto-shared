import { describe, it, expect } from "vitest";
import { toClerkUser, getErrorMessage } from "../lib/auth/helpers";
import type { User } from "@supabase/supabase-js";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-123",
    email: "test@example.com",
    user_metadata: {},
    app_metadata: {},
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  } as User;
}

describe("toClerkUser", () => {
  it("maps basic user fields", () => {
    const user = makeUser({
      id: "abc",
      email: "alice@test.com",
      user_metadata: {
        first_name: "Alice",
        last_name: "Smith",
        avatar_url: "https://img.example.com/alice.jpg",
        preferred_username: "alice",
      },
    });
    const result = toClerkUser(user);
    expect(result.id).toBe("abc");
    expect(result.primaryEmailAddress).toBe("alice@test.com");
    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Smith");
    expect(result.fullName).toBe("Alice Smith");
    expect(result.imageUrl).toBe("https://img.example.com/alice.jpg");
    expect(result.username).toBe("alice");
  });

  it("handles missing metadata gracefully", () => {
    const user = makeUser({ user_metadata: {}, app_metadata: {} });
    const result = toClerkUser(user);
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.fullName).toBeNull();
    expect(result.imageUrl).toBeNull();
    expect(result.username).toBeNull();
  });

  it("falls back to name when first_name is missing", () => {
    const user = makeUser({ user_metadata: { name: "Bob" } });
    const result = toClerkUser(user);
    expect(result.firstName).toBe("Bob");
    expect(result.fullName).toBe("Bob");
  });

  it("maps app_metadata to publicMetadata", () => {
    const user = makeUser({
      app_metadata: { role: "super_admin", plan: "pro", custom: "value" },
    });
    const result = toClerkUser(user);
    expect(result.publicMetadata.role).toBe("super_admin");
    expect(result.publicMetadata.plan).toBe("pro");
    expect(result.publicMetadata.custom).toBe("value");
  });

  it("uses picture fallback for imageUrl", () => {
    const user = makeUser({ user_metadata: { picture: "https://google.com/photo.jpg" } });
    const result = toClerkUser(user);
    expect(result.imageUrl).toBe("https://google.com/photo.jpg");
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("oops"), "fallback")).toBe("oops");
  });

  it("returns string errors directly", () => {
    expect(getErrorMessage("string error", "fallback")).toBe("string error");
  });

  it("returns fallback for non-error values", () => {
    expect(getErrorMessage(42, "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(getErrorMessage({}, "fallback")).toBe("fallback");
  });
});
