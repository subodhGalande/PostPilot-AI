import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryDraftStoreAdapter } from "./draft-store-adapter";
import {
  DraftStore,
  ValidationError,
  ConflictError,
  NotFoundError,
  DraftStoreError,
} from "./draft-store";

function makeLinkedInPost(content: string) {
  return {
    content,
    status: "DRAFT" as const,
    scheduledAt: null,
  };
}

function makeXPost(content: string) {
  return {
    mode: "single" as const,
    posts: [{ id: "1", content }],
    status: "DRAFT" as const,
    scheduledAt: null,
  };
}

function makeSaveInput(overrides: Record<string, unknown> = {}) {
  return {
    clientDraftKey: "test-key-1",
    post: {
      topic: "AI",
      baseIdea: "Post about AI",
      linkedin: makeLinkedInPost("LinkedIn content"),
      x: makeXPost("X content"),
    },
    model: "gemini-pro",
    ...overrides,
  };
}

function makeScheduleInput(overrides: Record<string, unknown> = {}) {
  return {
    clientDraftKey: "test-key-1",
    post: {
      topic: "AI",
      baseIdea: "Post about AI",
      linkedin: makeLinkedInPost("LinkedIn content"),
      x: makeXPost("X content"),
    },
    model: "gemini-pro",
    platform: "linkedin",
    scheduledAt: "2026-06-01T12:00:00.000Z",
    ...overrides,
  };
}

function waitForNextTimestamp() {
  return new Promise((resolve) => setTimeout(resolve, 1));
}

describe("DraftStore", () => {
  let adapter: InMemoryDraftStoreAdapter;
  let store: DraftStore;

  beforeEach(() => {
    adapter = new InMemoryDraftStoreAdapter();
    store = new DraftStore(adapter);
  });

  describe("saveDraft", () => {
    it("creates a new draft", async () => {
      const result = await store.saveDraft("user-1", makeSaveInput());

      expect(result.id).toBeTruthy();
      expect(result.title).toBe("Post about AI");
      expect(result.topic).toBe("AI");
      expect(result.model).toBe("gemini-pro");
      expect(result.clientDraftKey).toBe("test-key-1");
      expect(result.linkedinPost).not.toBeNull();
      expect(result.linkedinPost?.content).toBe("LinkedIn content");
      expect(result.xPost).not.toBeNull();
      expect(result.xPost?.content).toBe("X content");
    });

    it("updates an existing draft by id", async () => {
      const first = await store.saveDraft("user-1", makeSaveInput());

      const result = await store.saveDraft(
        "user-1",
        makeSaveInput({
          id: first.id,
          updatedAt: first.updatedAt,
          post: {
            topic: "AI",
            baseIdea: "Updated post",
            linkedin: makeLinkedInPost("Updated LinkedIn"),
            x: makeXPost("Updated X"),
          },
          model: "gemini-pro",
        }),
      );

      expect(result.id).toBe(first.id);
      expect(result.title).toBe("Updated post");
      expect(result.linkedinPost?.content).toBe("Updated LinkedIn");
      expect(result.xPost?.content).toBe("Updated X");
    });

    it("updates an existing draft by clientDraftKey", async () => {
      await store.saveDraft("user-1", makeSaveInput());

      const result = await store.saveDraft(
        "user-1",
        makeSaveInput({
          clientDraftKey: "test-key-1",
          post: {
            topic: "AI",
            baseIdea: "Updated from key",
            linkedin: makeLinkedInPost("Updated LinkedIn"),
            x: makeXPost("Updated X"),
          },
        }),
      );

      expect(result.title).toBe("Updated from key");
    });

    it("throws ConflictError on stale updatedAt", async () => {
      const first = await store.saveDraft("user-1", makeSaveInput());

      await expect(
        store.saveDraft(
          "user-1",
          makeSaveInput({
            id: first.id,
            updatedAt: "2020-01-01T00:00:00.000Z",
          }),
        ),
      ).rejects.toThrow(ConflictError);
    });

    it("throws DraftStoreError when post has no content", async () => {
      await expect(
        store.saveDraft("user-1", {
          clientDraftKey: "empty",
          post: {
            topic: "AI",
            baseIdea: "Empty post",
            linkedin: makeLinkedInPost(""),
            x: makeXPost(""),
          },
          model: "gemini-pro",
        }),
      ).rejects.toThrow(DraftStoreError);
    });

    it("throws ValidationError on invalid input", async () => {
      await expect(
        store.saveDraft("user-1", { invalid: true }),
      ).rejects.toThrow(ValidationError);
    });

    it("saves LinkedIn-only post", async () => {
      const result = await store.saveDraft(
        "user-1",
        makeSaveInput({
          post: {
            topic: "AI",
            baseIdea: "LinkedIn only",
            linkedin: makeLinkedInPost("Only LinkedIn"),
            x: {
              mode: "single",
              posts: [],
              status: "DRAFT",
              scheduledAt: null,
            },
          },
        }),
      );

      expect(result.linkedinPost?.content).toBe("Only LinkedIn");
      expect(result.xPost).toBeNull();
    });

    it("saves X-only post", async () => {
      const result = await store.saveDraft(
        "user-1",
        makeSaveInput({
          post: {
            topic: "AI",
            baseIdea: "X only",
            linkedin: { content: "", status: "DRAFT", scheduledAt: null },
            x: makeXPost("Only X"),
          },
        }),
      );

      expect(result.xPost?.content).toBe("Only X");
      expect(result.linkedinPost).toBeNull();
    });

    it("returns a fresh updatedAt after updating a platform draft", async () => {
      const first = await store.saveDraft(
        "user-1",
        makeSaveInput({ platform: "linkedin" }),
      );

      await waitForNextTimestamp();

      const second = await store.saveDraft(
        "user-1",
        makeSaveInput({
          id: first.id,
          updatedAt: first.updatedAt,
          platform: "x",
          post: {
            topic: "AI",
            baseIdea: "Saved both platforms",
            linkedin: makeLinkedInPost("LinkedIn content"),
            x: makeXPost("X content"),
          },
        }),
      );

      await waitForNextTimestamp();

      await expect(
        store.saveDraft(
          "user-1",
          makeSaveInput({
            id: second.id,
            updatedAt: second.updatedAt,
            platform: "linkedin",
            post: {
              topic: "AI",
              baseIdea: "Updated without conflict",
              linkedin: makeLinkedInPost("Updated LinkedIn"),
              x: makeXPost("X content"),
            },
          }),
        ),
      ).resolves.toMatchObject({
        id: first.id,
        title: "Updated without conflict",
      });
    });
  });

  describe("scheduleDraft", () => {
    it("creates a new scheduled post", async () => {
      const result = await store.scheduleDraft("user-1", makeScheduleInput());

      expect(result.id).toBeTruthy();
      expect(result.linkedinPost?.status).toBe("SCHEDULED");
      expect(result.linkedinPost?.scheduledAt).toEqual(
        new Date("2026-06-01T12:00:00.000Z"),
      );
    });

    it("throws DraftStoreError when platform is missing", async () => {
      await expect(
        store.scheduleDraft(
          "user-1",
          makeScheduleInput({ platform: undefined }),
        ),
      ).rejects.toThrow("Platform is required for scheduling");
    });

    it("updates an existing draft to scheduled", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());

      const result = await store.scheduleDraft(
        "user-1",
        makeScheduleInput({
          id: saved.id,
          updatedAt: saved.updatedAt,
          clientDraftKey: "test-key-1",
          post: {
            topic: "AI",
            baseIdea: "Now scheduling",
            linkedin: makeLinkedInPost("Scheduled LinkedIn"),
            x: makeXPost("Scheduled X"),
          },
        }),
      );

      expect(result.id).toBe(saved.id);
      expect(result.linkedinPost?.status).toBe("SCHEDULED");
    });
  });

  describe("unscheduleDraft", () => {
    it("reverts scheduled linkedin post to draft", async () => {
      const scheduled = await store.scheduleDraft(
        "user-1",
        makeScheduleInput(),
      );

      const result = await store.unscheduleDraft(
        "user-1",
        scheduled.id,
        "linkedin",
      );

      expect(result.linkedinPost?.status).toBe("DRAFT");
      expect(result.linkedinPost?.scheduledAt).toBeNull();
    });

    it("throws NotFoundError for non-existent draft", async () => {
      await expect(
        store.unscheduleDraft("user-1", "nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getDraft", () => {
    it("returns a draft by id", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());

      const result = await store.getDraft("user-1", saved.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(saved.id);
    });

    it("returns null for non-existent draft", async () => {
      const result = await store.getDraft("user-1", "nonexistent");
      expect(result).toBeNull();
    });

    it("returns null for draft with no active children", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());
      await store.deleteDraft("user-1", saved.id);

      const result = await store.getDraft("user-1", saved.id);
      expect(result).toBeNull();
    });

    it("does not return drafts owned by another user", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());

      const result = await store.getDraft("user-2", saved.id);
      expect(result).toBeNull();
    });
  });

  describe("deleteDraft", () => {
    it("deletes entire post", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());

      const { deletedEntirePost } = await store.deleteDraft("user-1", saved.id);

      expect(deletedEntirePost).toBe(true);
      const result = await store.getDraft("user-1", saved.id);
      expect(result).toBeNull();
    });

    it("deletes single platform child", async () => {
      const saved = await store.saveDraft("user-1", makeSaveInput());

      const { deletedEntirePost } = await store.deleteDraft(
        "user-1",
        saved.id,
        "linkedin",
      );

      expect(deletedEntirePost).toBe(false);
      const result = await store.getDraft("user-1", saved.id);
      expect(result).not.toBeNull();
      expect(result?.linkedinPost).toBeNull();
      expect(result?.xPost).not.toBeNull();
    });

    it("cleans up entire post when last platform is deleted", async () => {
      const saved = await store.saveDraft(
        "user-1",
        makeSaveInput({
          post: {
            topic: "AI",
            baseIdea: "Only LinkedIn",
            linkedin: makeLinkedInPost("LinkedIn only"),
            x: {
              mode: "single",
              posts: [],
              status: "DRAFT",
              scheduledAt: null,
            },
          },
        }),
      );

      await store.deleteDraft("user-1", saved.id, "linkedin");

      const result = await store.getDraft("user-1", saved.id);
      expect(result).toBeNull();
    });

    it("throws NotFoundError for non-existent draft", async () => {
      await expect(store.deleteDraft("user-1", "nonexistent")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("listDrafts", () => {
    it("lists drafts for a user", async () => {
      await store.saveDraft(
        "user-1",
        makeSaveInput({ clientDraftKey: "key-1" }),
      );
      await store.saveDraft(
        "user-1",
        makeSaveInput({
          clientDraftKey: "key-2",
          post: {
            topic: "ML",
            baseIdea: "ML post",
            linkedin: makeLinkedInPost("ML content"),
            x: makeXPost("ML X"),
          },
        }),
      );

      const drafts = await store.listDrafts("user-1", "drafts");

      expect(drafts).toHaveLength(2);
    });

    it("does not include drafts from other users", async () => {
      await store.saveDraft("user-1", makeSaveInput());
      await store.saveDraft(
        "user-2",
        makeSaveInput({
          clientDraftKey: "key-2",
          post: {
            topic: "ML",
            baseIdea: "ML post",
            linkedin: makeLinkedInPost("ML content"),
            x: makeXPost("ML X"),
          },
        }),
      );

      const drafts = await store.listDrafts("user-1", "drafts");

      expect(drafts).toHaveLength(1);
    });

    it("lists scheduled posts separately", async () => {
      await store.saveDraft(
        "user-1",
        makeSaveInput({ clientDraftKey: "key-1" }),
      );
      await store.scheduleDraft(
        "user-1",
        makeScheduleInput({
          clientDraftKey: "key-2",
          post: {
            topic: "ML",
            baseIdea: "Scheduled ML",
            linkedin: makeLinkedInPost("Scheduled LinkedIn"),
            x: makeXPost("Scheduled X"),
          },
          platform: "linkedin",
        }),
      );

      const drafts = await store.listDrafts("user-1", "drafts");
      const scheduled = await store.listDrafts("user-1", "scheduled");

      expect(drafts).toHaveLength(1);
      expect(scheduled).toHaveLength(1);
    });
  });
});
