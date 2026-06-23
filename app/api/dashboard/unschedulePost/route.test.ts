import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/server/draft-store", () => ({
  draftStore: {
    unscheduleDraft: vi.fn(),
  },
  NotFoundError: class extends Error {},
}));

describe("POST /api/dashboard/unschedulePost", () => {
  let draftStoreMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    draftStoreMock = (await import("@/lib/server/draft-store")).draftStore;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/unschedulePost", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful unschedule", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    draftStoreMock.unscheduleDraft.mockResolvedValueOnce({
      id: "draft1",
      status: "DRAFT",
    });

    const req = new Request("http://localhost/api/dashboard/unschedulePost", {
      method: "POST",
      body: JSON.stringify({ id: "123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
