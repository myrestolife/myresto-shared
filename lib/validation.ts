/**
 * Shared validation schemas and utilities for MyResto apps.
 *
 * Uses simple runtime validation (no Zod dependency required).
 * For complex schemas, consuming apps can pair these with Zod.
 *
 * Usage:
 * ```ts
 * import { validateEmail, validatePassword, validate } from '@myresto/shared/lib/validation';
 *
 * const result = validatePassword("MyPass123");
 * if (!result.valid) console.error(result.errors);
 * ```
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate an email address format. */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }
  return { valid: errors.length === 0, errors };
}

/** Validate password strength. */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
    return { valid: false, errors };
  }
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return { valid: errors.length === 0, errors };
}

/** Validate that a value is a non-empty string. */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const errors: string[] = [];
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    errors.push(`${fieldName} is required`);
  }
  return { valid: errors.length === 0, errors };
}

/** Run multiple validators and merge results. */
export function validate(
  ...results: ValidationResult[]
): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}
