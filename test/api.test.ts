import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiFetch, createFileUpload, ApiError } from "../lib/api";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ApiError", () => {
  it("carries status, url, and body", () => {
    const err = new ApiError("Not found", 404, "/api/test", { error: "Not found" });
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err.url).toBe("/api/test");
    expect(err.body).toEqual({ error: "Not found" });
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("createApiFetch", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("makes a GET request by default", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: "ok" }));

    const apiFetch = createApiFetch("/api");
    const result = await apiFetch<{ data: string }>("/test");

    expect(result).toEqual({ data: "ok" });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/test");
    expect(opts.method).toBe("GET");
  });

  it("sends Authorization header when token provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const apiFetch = createApiFetch("/api");
    await apiFetch("/test", { token: "my-token" });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["Authorization"]).toBe("Bearer my-token");
  });

  it("includes X-Request-Id header", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const apiFetch = createApiFetch("/api");
    await apiFetch("/test", { requestId: "req-123" });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["X-Request-Id"]).toBe("req-123");
  });

  it("auto-generates X-Request-Id when not provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const apiFetch = createApiFetch("/api");
    await apiFetch("/test");

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["X-Request-Id"]).toBeTruthy();
  });

  it("sends JSON body for POST", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }));

    const apiFetch = createApiFetch("/api");
    await apiFetch("/items", { method: "POST", body: { name: "test" } });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe('{"name":"test"}');
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Not found" }, 404));

    const apiFetch = createApiFetch("/api");

    await expect(apiFetch("/missing")).rejects.toThrow(ApiError);
  });

  it("ApiError includes status and url", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Forbidden" }, 403));

    const apiFetch = createApiFetch("/api");

    try {
      await apiFetch("/secret");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(403);
      expect(err.url).toBe("/api/secret");
      expect(err.message).toBe("Forbidden");
    }
  });
});

describe("createFileUpload", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("uploads a file with correct headers", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ url: "https://cdn.example.com/file.jpg" }));

    const upload = createFileUpload("/api");
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const result = await upload("/upload", file, "token-abc");

    expect(result).toEqual({ url: "https://cdn.example.com/file.jpg" });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/upload");
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("image/jpeg");
    expect(opts.headers["Authorization"]).toBe("Bearer token-abc");
    expect(opts.headers["X-Request-Id"]).toBeTruthy();
  });

  it("throws ApiError on failure", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Too large" }, 413));

    const upload = createFileUpload("/api");
    const file = new File(["x"], "big.bin", { type: "application/octet-stream" });

    await expect(upload("/upload", file)).rejects.toThrow(ApiError);
  });
});
