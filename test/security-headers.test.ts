import { describe, it, expect } from "vitest";
import { getSecurityHeaders } from "../lib/security-headers";

describe("getSecurityHeaders", () => {
  it("returns an array containing all default security headers", () => {
    const headers = getSecurityHeaders();
    const keys = headers.map((h) => h.key);

    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("X-XSS-Protection");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("Strict-Transport-Security");
  });

  it("includes X-Frame-Options set to DENY", () => {
    const headers = getSecurityHeaders();
    const xfo = headers.find((h) => h.key === "X-Frame-Options");

    expect(xfo).toBeDefined();
    expect(xfo!.value).toBe("DENY");
  });

  it("includes Strict-Transport-Security by default", () => {
    const headers = getSecurityHeaders();
    const hsts = headers.find((h) => h.key === "Strict-Transport-Security");

    expect(hsts).toBeDefined();
    expect(hsts!.value.length).toBeGreaterThan(0);
  });

  it("omits Strict-Transport-Security when hsts is false", () => {
    const headers = getSecurityHeaders({ hsts: false });
    const keys = headers.map((h) => h.key);

    expect(keys).not.toContain("Strict-Transport-Security");
  });

  it("uses custom CSP value when provided", () => {
    const customCsp = "default-src 'self'; script-src 'none'";
    const headers = getSecurityHeaders({ csp: customCsp });
    const csp = headers.find((h) => h.key === "Content-Security-Policy");

    expect(csp).toBeDefined();
    expect(csp!.value).toBe(customCsp);
  });
});
