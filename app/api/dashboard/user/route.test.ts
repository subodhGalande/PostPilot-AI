import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

describe("GET /api/dashboard/user", () => {
  let prismaMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const _req = new Request("http://localhost/api/dashboard/user");
    const res = await GET(); // Next.js handles req via params or closures, but our route uses requireAuthJose
    expect(res.status).toBe(401);
  });

  it("returns 404 if user not found in DB", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const _req = new Request("http://localhost/api/dashboard/user");
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns 200 with user data", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "user1",
      email: "test@example.com",
      name: "Test",
    });

    const _req = new Request("http://localhost/api/dashboard/user");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: "user1",
      email: "test@example.com",
      name: "Test",
    });
  });
});
