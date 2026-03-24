import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentApp, isValidAppId, APP_DOMAINS } from "../lib/config";

describe("isValidAppId", () => {
  it("returns true for valid app IDs", () => {
    expect(isValidAppId("event")).toBe(true);
    expect(isValidAppId("garage")).toBe(true);
    expect(isValidAppId("club")).toBe(true);
    expect(isValidAppId("hub")).toBe(true);
    expect(isValidAppId("gear")).toBe(true);
    expect(isValidAppId("parts")).toBe(true);
    expect(isValidAppId("life")).toBe(true);
    expect(isValidAppId("show")).toBe(true);
  });

  it("returns false for invalid app IDs", () => {
    expect(isValidAppId("")).toBe(false);
    expect(isValidAppId("invalid")).toBe(false);
    expect(isValidAppId("Event")).toBe(false);
  });
});

describe("getCurrentApp", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when no env or hostname", () => {
    expect(getCurrentApp(undefined, undefined)).toBe(null);
  });

  it("resolves from envAppId parameter", () => {
    expect(getCurrentApp("event")).toBe("event");
    expect(getCurrentApp("garage")).toBe("garage");
  });

  it("ignores invalid envAppId", () => {
    expect(getCurrentApp("invalid", "myrestoevent.com")).toBe("event");
  });

  it("resolves from hostname parameter", () => {
    expect(getCurrentApp(undefined, "myrestoevent.com")).toBe("event");
    expect(getCurrentApp(undefined, "www.myrestogarage.com")).toBe("garage");
    expect(getCurrentApp(undefined, "beta.myrestoclub.com")).toBe("club");
  });

  it("prefers envAppId over hostname", () => {
    expect(getCurrentApp("garage", "myrestoevent.com")).toBe("garage");
  });

  it("returns null for unknown hostname", () => {
    expect(getCurrentApp(undefined, "unknown.example.com")).toBe(null);
  });

  it("resolves from NEXT_PUBLIC_APP_ID env var", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "hub");
    expect(getCurrentApp()).toBe("hub");
  });
});

describe("APP_DOMAINS", () => {
  it("maps known domains", () => {
    expect(APP_DOMAINS["myrestoevent.com"]).toEqual({ app: "event", name: "MyRestoEvent" });
    expect(APP_DOMAINS["myrestoclub.com"]).toEqual({ app: "club", name: "MyRestoClub" });
  });
});
