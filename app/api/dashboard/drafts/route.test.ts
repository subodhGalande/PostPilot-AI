import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/server/draft-store", () => ({
  draftStore: {
    listDrafts: vi.fn(),
  },
}));

describe("GET /api/dashboard/drafts", () => {
  let draftStoreMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    draftStoreMock = (await import("@/lib/server/draft-store")).draftStore;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/drafts");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns drafts from draftStore", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });
    draftStoreMock.listDrafts.mockResolvedValueOnce([{ id: "draft1" }]);

    const req = new Request(
      "http://localhost/api/dashboard/drafts?fetch=scheduled",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "draft1" }]);
    expect(draftStoreMock.listDrafts).toHaveBeenCalledWith(
      "user1",
      "scheduled",
    );
  });
});
