import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/server/draft-store", () => ({
  draftStore: {
    scheduleDraft: vi.fn(),
  },
  DraftStoreError: class extends Error {},
  ConflictError: class extends Error {
    currentUpdatedAt: string;
    constructor(msg: string, updatedAt: string) {
      super(msg);
      this.currentUpdatedAt = updatedAt;
    }
  },
  ValidationError: class extends Error {
    details: any;
    constructor(msg: string, details: any) {
      super(msg);
      this.details = details;
    }
  },
}));

describe("POST /api/dashboard/schedulePost", () => {
  let draftStoreMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    draftStoreMock = (await import("@/lib/server/draft-store")).draftStore;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/schedulePost", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful schedule", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    draftStoreMock.scheduleDraft.mockResolvedValueOnce({
      id: "draft1",
      status: "SCHEDULED",
    });

    const req = new Request("http://localhost/api/dashboard/schedulePost", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
