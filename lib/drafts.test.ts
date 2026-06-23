import { describe, it, expect } from "vitest";
import {
  reconstructPostContent,
  mapStoredDraftToGeneratedPostPack,
} from "./drafts";

describe("drafts logic", () => {
  describe("reconstructPostContent", () => {
    it("assigns DRAFT status and null scheduledAt if missing", () => {
      const input = {
        topic: "Test Topic",
        baseIdea: "Test Idea",
        model: "gpt-4o",
      };

      const result = reconstructPostContent(input);

      expect(result.linkedin.status).toBe("DRAFT");
      expect(result.linkedin.scheduledAt).toBeNull();
      expect(result.x.status).toBe("DRAFT");
      expect(result.x.scheduledAt).toBeNull();
    });

    it("isolates platform variants correctly based on Relational SSOT", () => {
      const date = new Date("2026-06-23T12:00:00Z");
      const input = {
        topic: "Test Topic",
        baseIdea: "Test Idea",
        model: "gpt-4o",
        linkedinPost: {
          content: "LinkedIn Content",
          status: "SCHEDULED",
          scheduledAt: date,
        },
        xPost: {
          mode: "thread",
          threadPosts: [{ id: "1", content: "X Thread Content" }],
          status: "PUBLISHED",
          scheduledAt: date.toISOString(),
        },
      };

      const result = reconstructPostContent(input);

      expect(result.linkedin.content).toBe("LinkedIn Content");
      expect(result.linkedin.status).toBe("SCHEDULED");
      expect(result.linkedin.scheduledAt).toBe(date.toISOString());

      expect(result.x.mode).toBe("thread");
      expect(result.x.posts).toEqual([
        { id: "1", content: "X Thread Content" },
      ]);
      expect(result.x.status).toBe("PUBLISHED");
      expect(result.x.scheduledAt).toBe(date.toISOString());
    });
  });

  describe("mapStoredDraftToGeneratedPostPack", () => {
    it("maps stored draft to GeneratedPostPack correctly", () => {
      const stored = {
        topic: "Test Topic",
        baseIdea: "Test Idea",
        model: "gpt-4o",
        linkedin: {
          content: "LinkedIn Content",
          status: "DRAFT",
          scheduledAt: null,
        },
        x: {
          mode: "single" as const,
          posts: [{ id: "1", content: "X Content" }],
          status: "DRAFT",
          scheduledAt: null,
        },
      };

      const result = mapStoredDraftToGeneratedPostPack(stored);

      expect(result.model).toBe("gpt-4o");
      expect(result.post.baseIdea).toBe("Test Idea");
      expect(result.post.linkedin.content).toBe("LinkedIn Content");
      expect(result.post.x.posts[0].content).toBe("X Content");
    });
  });
});
