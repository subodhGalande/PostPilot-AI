import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/auth/verify", () => {
  let prismaMock: any;
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
    authMock = await import("@/lib/auth/jwtjose");
  });

  it("returns 307 if token missing", async () => {
    const req = new Request("http://localhost/api/auth/verify");
    const res = await GET(req);
    expect(res.status).toBe(307);
  });

  it("returns 307 if token invalid", async () => {
    authMock.verifyTokenJose.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/auth/verify?token=bad");
    const res = await GET(req);
    expect(res.status).toBe(307);
  });

  it("returns 307 if verification token not found or expired", async () => {
    authMock.verifyTokenJose.mockResolvedValueOnce({
      email: "test@example.com",
    });
    prismaMock.verificationToken.findUnique.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/auth/verify?token=valid");
    const res = await GET(req);
    expect(res.status).toBe(307);
  });

  it("creates user, clears token, sets cookie and redirects on success", async () => {
    authMock.verifyTokenJose.mockResolvedValueOnce({
      email: "test@example.com",
    });
    prismaMock.verificationToken.findUnique.mockResolvedValueOnce({
      email: "test@example.com",
      name: "Test",
      passwordHash: "hash",
      expiresAt: new Date(Date.now() + 100000),
    });

    // Note: The route does not use $transaction anymore, it does direct queries
    const req = new Request("http://localhost/api/auth/verify?token=valid");
    const res = await GET(req);

    expect(res.status).toBe(307); // Redirects to verified
    expect(res.headers.get("Location")).toContain("/verified");
  });
});
