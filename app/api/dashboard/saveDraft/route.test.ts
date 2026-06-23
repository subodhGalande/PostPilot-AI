import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/server/draft-store", () => ({
  draftStore: {
    saveDraft: vi.fn(),
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

describe("POST /api/dashboard/saveDraft", () => {
  let draftStoreMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    draftStoreMock = (await import("@/lib/server/draft-store")).draftStore;
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/saveDraft", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful save", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });
    draftStoreMock.saveDraft.mockResolvedValueOnce({ id: "draft1" });

    const req = new Request("http://localhost/api/dashboard/saveDraft", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "draft1" });
  });

  it("returns 409 on version conflict", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" });

    const ConflictError = (await import("@/lib/server/draft-store"))
      .ConflictError;
    draftStoreMock.saveDraft.mockRejectedValueOnce(
      new ConflictError("conflict", "2024"),
    );

    const req = new Request("http://localhost/api/dashboard/saveDraft", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});
