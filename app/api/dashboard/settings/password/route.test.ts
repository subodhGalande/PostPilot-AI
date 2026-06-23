import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

describe("PATCH /api/dashboard/settings/password", () => {
  let prismaMock: any;
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
    authMock = await import("@/lib/auth/auth");
  });

  it("returns 401 if unauthorized", async () => {
    authMock.requireAuthJose.mockResolvedValueOnce(null);
    const req = new Request(
      "http://localhost/api/dashboard/settings/password",
      { method: "PATCH" },
    );
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for JSON parse error", async () => {
    authMock.requireAuthJose.mockResolvedValueOnce({ id: "1" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "1",
      provider: "CREDENTIALS",
      passwordHash: "hash",
    });
    const req = new Request(
      "http://localhost/api/dashboard/settings/password",
      {
        method: "PATCH",
        body: "{ bad json }",
      },
    );
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 if user not found", async () => {
    authMock.requireAuthJose.mockResolvedValueOnce({ id: "1" });
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const req = new Request(
      "http://localhost/api/dashboard/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "pwd",
          newPassword: "NewPassword1!",
        }),
      },
    );
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it("returns 401 if current password wrong", async () => {
    authMock.requireAuthJose.mockResolvedValueOnce({ id: "1" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "1",
      provider: "CREDENTIALS",
      passwordHash: "hash",
    });
    authMock.verifyPassword.mockResolvedValueOnce(false);

    const req = new Request(
      "http://localhost/api/dashboard/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "wrong",
          newPassword: "NewPassword1!",
        }),
      },
    );
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful password change", async () => {
    authMock.requireAuthJose.mockResolvedValueOnce({ id: "1" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "1",
      provider: "CREDENTIALS",
      passwordHash: "hash",
    });
    authMock.verifyPassword.mockResolvedValueOnce(true);
    authMock.hashPassword.mockResolvedValueOnce("new-hash");

    const req = new Request(
      "http://localhost/api/dashboard/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "pwd",
          newPassword: "NewPassword1!",
        }),
      },
    );
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});
