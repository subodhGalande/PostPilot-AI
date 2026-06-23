import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";

describe("DELETE /api/dashboard/settings/account", () => {
  let prismaMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/settings/account", {
      method: "DELETE",
    });
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("returns 200 and deletes account from DB", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });

    const req = new Request("http://localhost/api/dashboard/settings/account", {
      method: "DELETE",
    });
    const res = await DELETE();

    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(res.status).toBe(200);
  });
});
