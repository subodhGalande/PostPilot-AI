import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

describe("PATCH /api/dashboard/onboarding", () => {
  let prismaMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/onboarding", {
      method: "PATCH",
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid schema", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    const req = new Request("http://localhost/api/dashboard/onboarding", {
      method: "PATCH",
      body: JSON.stringify({}), // missing accountType triggers TypeError -> 400
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful onboarding update", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    prismaMock.user.update.mockResolvedValueOnce({ id: "1", onboarded: true });

    const req = new Request("http://localhost/api/dashboard/onboarding", {
      method: "PATCH",
      body: JSON.stringify({
        accountType: "Personal",
        accountName: "Test User",
        industry: "Software",
        description: "A description",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});
