import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/auth/login", () => {
  let prismaMock: any;
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
    authMock = await import("@/lib/auth/auth");
  });

  it("returns 400 for invalid input", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 if user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 if password invalid", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "1",
      email: "test@example.com",
      passwordHash: "hash",
      verified: true,
    });
    authMock.verifyPassword.mockResolvedValueOnce(false);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 and sets cookie on success", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "1",
      email: "test@example.com",
      passwordHash: "hash",
      verified: true,
      tokenVersion: 1,
    });
    authMock.verifyPassword.mockResolvedValueOnce(true);
    authMock.signToken.mockResolvedValueOnce("mock-jwt");

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toContain("mock-jose-token");
  });
});
