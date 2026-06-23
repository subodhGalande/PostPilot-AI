import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

describe("PATCH /api/dashboard/profile", () => {
  let prismaMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/profile", {
      method: "PATCH",
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful profile update", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    prismaMock.user.update.mockResolvedValueOnce({ id: "1" });

    const req = new Request("http://localhost/api/dashboard/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});
