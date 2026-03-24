import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validate,
} from "../lib/validation";

describe("validateEmail", () => {
  it("returns valid for a correct email", () => {
    const result = validateEmail("user@example.com");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for missing @ symbol", () => {
    const result = validateEmail("userexample.com");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns error for missing domain", () => {
    const result = validateEmail("user@");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns error for missing local part", () => {
    const result = validateEmail("@example.com");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty string", () => {
    const result = validateEmail("");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns error for string with no TLD", () => {
    const result = validateEmail("user@example");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validatePassword", () => {
  it("returns valid for a strong password", () => {
    const result = validatePassword("Str0ngPass");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for a short password", () => {
    const result = validatePassword("Ab1");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("8"))).toBe(true);
  });

  it("returns error when missing uppercase letter", () => {
    const result = validatePassword("alllower1");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("uppercase"))
    ).toBe(true);
  });

  it("returns error when missing lowercase letter", () => {
    const result = validatePassword("ALLUPPER1");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("lowercase"))
    ).toBe(true);
  });

  it("returns error when missing a number", () => {
    const result = validatePassword("NoNumbersHere");
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.toLowerCase().includes("number"))
    ).toBe(true);
  });

  it("returns error for empty string", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateRequired", () => {
  it("returns valid for a non-empty string", () => {
    const result = validateRequired("hello", "name");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for an empty string with field name in message", () => {
    const result = validateRequired("", "name");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("name"))).toBe(true);
  });

  it("returns error for null with field name in message", () => {
    const result = validateRequired(null, "email");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("email"))).toBe(true);
  });

  it("returns error for undefined with field name in message", () => {
    const result = validateRequired(undefined, "phone");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("phone"))).toBe(true);
  });
});

describe("validate", () => {
  it("merges errors from multiple invalid results", () => {
    const r1 = { valid: false, errors: ["Error A"] };
    const r2 = { valid: false, errors: ["Error B", "Error C"] };
    const merged = validate(r1, r2);
    expect(merged.valid).toBe(false);
    expect(merged.errors).toContain("Error A");
    expect(merged.errors).toContain("Error B");
    expect(merged.errors).toContain("Error C");
    expect(merged.errors).toHaveLength(3);
  });

  it("returns valid when all results are valid", () => {
    const r1 = { valid: true, errors: [] };
    const r2 = { valid: true, errors: [] };
    const merged = validate(r1, r2);
    expect(merged.valid).toBe(true);
    expect(merged.errors).toHaveLength(0);
  });

  it("returns invalid when at least one result is invalid", () => {
    const r1 = { valid: true, errors: [] };
    const r2 = { valid: false, errors: ["Something wrong"] };
    const merged = validate(r1, r2);
    expect(merged.valid).toBe(false);
    expect(merged.errors).toHaveLength(1);
  });
});
