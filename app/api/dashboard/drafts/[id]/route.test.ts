import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "./route";

vi.mock("@/lib/server/draft-store", () => ({
  draftStore: {
    getDraft: vi.fn(),
    deleteDraft: vi.fn(),
  },
  NotFoundError: class extends Error {},
}));

describe("API /api/dashboard/drafts/[id]", () => {
  let draftStoreMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    draftStoreMock = (await import("@/lib/server/draft-store")).draftStore;
  });

  describe("GET", () => {
    it("returns 401 if unauthorized", async () => {
      vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
        .fn()
        .mockResolvedValueOnce(null);
      const req = new Request("http://localhost/api/dashboard/drafts/1");
      const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(401);
    });

    it("returns 404 if draft not found", async () => {
      vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
        .fn()
        .mockResolvedValueOnce({ id: "user1" });
      draftStoreMock.getDraft.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/dashboard/drafts/1");
      const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 200 with formatted draft", async () => {
      vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
        .fn()
        .mockResolvedValueOnce({ id: "user1" });
      draftStoreMock.getDraft.mockResolvedValueOnce({
        id: "1",
        title: "Test",
        topic: "Topic",
        baseIdea: "Idea",
        model: "gpt-4",
        createdAt: "date",
        updatedAt: "date",
        linkedinPost: { content: "li", status: "DRAFT", scheduledAt: null },
        xPost: null,
      });

      const req = new Request("http://localhost/api/dashboard/drafts/1");
      const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.linkedin.content).toBe("li");
      expect(data.x).toBeNull();
    });
  });

  describe("DELETE", () => {
    it("returns 404 if NotFoundError is thrown", async () => {
      vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
        .fn()
        .mockResolvedValueOnce({ id: "user1" });
      const NotFoundError = (await import("@/lib/server/draft-store"))
        .NotFoundError;
      draftStoreMock.deleteDraft.mockRejectedValueOnce(new NotFoundError());

      const req = new Request("http://localhost/api/dashboard/drafts/1");
      const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 200 on successful partial deletion (platform passed)", async () => {
      vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
        .fn()
        .mockResolvedValueOnce({ id: "user1" });
      draftStoreMock.deleteDraft.mockResolvedValueOnce({ deleted: true });

      const req = new Request(
        "http://localhost/api/dashboard/drafts/1?platform=x",
      );
      const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(200);
      expect(draftStoreMock.deleteDraft).toHaveBeenCalledWith(
        "user1",
        "1",
        "x",
      );
    });
  });
});
