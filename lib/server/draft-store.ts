import type { z } from "zod";
import { saveDraftSchema, schedulePostSchema } from "@/lib/schemas/post.schema";
import type { GeneratedPostItem } from "@/lib/schemas/social.schema";
import {
  PrismaDraftStoreAdapter,
  type DraftStoreAdapter,
} from "./draft-store-adapter";

export class DraftStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DraftStoreError";
  }
}

export class ConflictError extends DraftStoreError {
  currentUpdatedAt: string;

  constructor(message: string, currentUpdatedAt: string) {
    super(message);
    this.name = "ConflictError";
    this.currentUpdatedAt = currentUpdatedAt;
  }
}

export class NotFoundError extends DraftStoreError {
  constructor(message = "Draft not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DraftStoreError {
  details: ReturnType<z.ZodError["flatten"]>;

  constructor(error: z.ZodError) {
    super("Invalid request body");
    this.name = "ValidationError";
    this.details = error.flatten();
  }
}

export interface PlatformVariantResult {
  id: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
  mode?: string | null;
  threadPosts?: unknown;
}

export interface DraftStoreResult {
  id: string;
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string | null;
  createdAt: Date;
  updatedAt: string;
  linkedinPost: PlatformVariantResult | null;
  xPost: PlatformVariantResult | null;
}

function buildPostData(
  post: GeneratedPostItem,
  model: string,
  clientDraftKey: string,
) {
  return {
    title: post.baseIdea.trim(),
    topic: post.topic,
    baseIdea: post.baseIdea,
    model,
    clientDraftKey,
  };
}

function hasContent(post: GeneratedPostItem): boolean {
  const hasLinkedIn = (post.linkedin?.content?.trim().length ?? 0) > 0;
  const hasX =
    (post.x?.posts?.length ?? 0) > 0 &&
    (post.x.posts[0]?.content?.trim().length ?? 0) > 0;
  return hasLinkedIn || hasX;
}

function detectConflict(
  existing: { updatedAt: Date },
  updatedAt?: string,
): void {
  if (updatedAt && existing.updatedAt.toISOString() !== updatedAt) {
    throw new ConflictError(
      "This post was updated in another tab. Refresh before proceeding.",
      existing.updatedAt.toISOString(),
    );
  }
}

function formatLinkedInResult(post: any): PlatformVariantResult | null {
  if (!post) return null;
  return {
    id: post.id,
    content: post.content,
    status: post.status,
    scheduledAt: post.scheduledAt,
  };
}

function formatXResult(post: any): PlatformVariantResult | null {
  if (!post) return null;
  return {
    id: post.id,
    content: post.content,
    mode: post.mode,
    threadPosts: post.threadPosts,
    status: post.status,
    scheduledAt: post.scheduledAt,
  };
}

function formatResult(post: any): DraftStoreResult {
  return {
    id: post.id,
    title: post.title ?? "",
    topic: post.topic ?? "",
    baseIdea: post.baseIdea ?? "",
    model: post.model ?? "",
    clientDraftKey: post.clientDraftKey,
    createdAt: post.createdAt,
    updatedAt:
      post.updatedAt instanceof Date
        ? post.updatedAt.toISOString()
        : post.updatedAt,
    linkedinPost: formatLinkedInResult(post.linkedinPost),
    xPost: formatXResult(post.xPost) as any,
  };
}

export class DraftStore {
  constructor(private adapter: DraftStoreAdapter) {}

  async saveDraft(userId: string, input: unknown): Promise<DraftStoreResult> {
    const parsed = saveDraftSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error);

    const { id, clientDraftKey, updatedAt, post, model, platform } =
      parsed.data;

    if (!hasContent(post)) {
      throw new DraftStoreError("At least one platform must have content");
    }

    const postData = buildPostData(post, model, clientDraftKey);
    const existing = await this.adapter.findPostMeta(
      userId,
      id,
      clientDraftKey,
    );

    if (existing) {
      detectConflict(existing, updatedAt);

      const childOps = this.buildChildUpserts(
        existing.id,
        post,
        "DRAFT",
        platform,
      );
      const ops: (() => Promise<any>)[] = [
        () => this.adapter.updatePost(existing.id, postData),
        ...childOps,
      ];

      if (ops.length > 1) {
        await this.adapter.batch(ops);
      } else {
        await ops[0]();
      }

      const freshPost =
        (await this.adapter.findPostMeta(userId, existing.id)) ?? existing;
      const children = await this.adapter.findChildren(existing.id);
      return formatResult({
        ...freshPost,
        ...postData,
        ...children,
      });
    }

    const created = await this.adapter.createPost({ ...postData, userId });
    const childOps = this.buildChildUpserts(
      created.id,
      post,
      "DRAFT",
      platform,
    );
    if (childOps.length > 0) {
      await this.adapter.batch(childOps);
    }

    const children = await this.adapter.findChildren(created.id);
    return formatResult({ ...created, ...postData, ...children });
  }

  async scheduleDraft(
    userId: string,
    input: unknown,
  ): Promise<DraftStoreResult> {
    const parsed = schedulePostSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error);

    const {
      id,
      clientDraftKey,
      updatedAt,
      post,
      model,
      platform,
      scheduledAt,
    } = parsed.data;

    if (!platform) {
      throw new DraftStoreError("Platform is required for scheduling");
    }

    if (!hasContent(post)) {
      throw new DraftStoreError("At least one platform must have content");
    }

    const postData = buildPostData(post, model, clientDraftKey);
    const scheduledDate = new Date(scheduledAt);
    const existing = await this.adapter.findPostMeta(
      userId,
      id,
      clientDraftKey,
    );

    if (existing) {
      detectConflict(existing, updatedAt);

      const childOps = this.buildChildUpserts(
        existing.id,
        post,
        "SCHEDULED",
        platform,
        scheduledDate,
      );
      const ops: (() => Promise<any>)[] = [
        () => this.adapter.updatePost(existing.id, postData),
        ...childOps,
      ];

      await this.adapter.batch(ops);

      const freshPost =
        (await this.adapter.findPostMeta(userId, existing.id)) ?? existing;
      const children = await this.adapter.findChildren(existing.id);
      return formatResult({
        ...freshPost,
        ...postData,
        ...children,
      });
    }

    const created = await this.adapter.createPost({ ...postData, userId });
    const childOps = this.buildChildUpserts(
      created.id,
      post,
      "SCHEDULED",
      platform,
      scheduledDate,
    );
    if (childOps.length > 0) {
      await this.adapter.batch(childOps);
    }

    const children = await this.adapter.findChildren(created.id);
    return formatResult({ ...created, ...postData, ...children });
  }

  async unscheduleDraft(
    userId: string,
    id: string,
    platform?: "linkedin" | "x",
  ): Promise<DraftStoreResult> {
    const existing = await this.adapter.findPostMeta(userId, id);
    if (!existing) throw new NotFoundError();

    const ops: (() => Promise<any>)[] = [];
    const unscheduleLinkedIn = !platform || platform === "linkedin";
    const unscheduleX = !platform || platform === "x";

    if (unscheduleLinkedIn) {
      ops.push(() =>
        this.adapter.updateLinkedInPost(id, {
          status: "DRAFT",
          scheduledAt: null,
        }),
      );
    }

    if (unscheduleX) {
      ops.push(() =>
        this.adapter.updateXPost(id, {
          status: "DRAFT",
          scheduledAt: null,
        }),
      );
    }

    if (ops.length > 0) {
      await this.adapter.batch(ops);
    }

    const children = await this.adapter.findChildren(id);
    return formatResult({ ...existing, ...children });
  }

  async getDraft(userId: string, id: string): Promise<DraftStoreResult | null> {
    const post = await this.adapter.findPostWithChildren(userId, id);
    if (!post) return null;

    const linkedInActive =
      post.linkedinPost &&
      ["DRAFT", "SCHEDULED"].includes(post.linkedinPost.status);
    const xActive =
      post.xPost && ["DRAFT", "SCHEDULED"].includes(post.xPost.status);

    if (!linkedInActive && !xActive) return null;

    return formatResult(post);
  }

  async deleteDraft(
    userId: string,
    id: string,
    platform?: "linkedin" | "x",
  ): Promise<{ success: boolean; deletedEntirePost: boolean }> {
    const post = await this.adapter.findPostWithChildren(userId, id);
    if (!post) throw new NotFoundError();

    if (platform) {
      const isLinkedIn = platform === "linkedin";

      let otherHasContent = false;
      if (isLinkedIn) {
        otherHasContent =
          (!!post.xPost?.threadPosts &&
            (post.xPost.threadPosts as any[]).length > 0) ||
          post.xPost?.status === "SCHEDULED";
      } else {
        otherHasContent =
          (post.linkedinPost?.content?.trim().length ?? 0) > 0 ||
          post.linkedinPost?.status === "SCHEDULED";
      }

      if (isLinkedIn && post.linkedinPost) {
        await this.adapter.deleteLinkedInPost(id);
      }
      if (!isLinkedIn && post.xPost) {
        await this.adapter.deleteXPost(id);
      }

      if (!otherHasContent) {
        await this.adapter.deletePost(id);
        return { success: true, deletedEntirePost: true };
      }

      return { success: true, deletedEntirePost: false };
    }

    await this.adapter.deletePost(id);
    return { success: true, deletedEntirePost: true };
  }

  async listDrafts(
    userId: string,
    fetchType: "drafts" | "scheduled" = "drafts",
  ): Promise<DraftStoreResult[]> {
    const targetStatus = fetchType === "scheduled" ? "SCHEDULED" : "DRAFT";
    const posts = await this.adapter.findPostsByUser(userId, targetStatus);
    return posts.map(formatResult);
  }

  private buildChildUpserts(
    postId: string,
    post: GeneratedPostItem,
    status: string,
    platform: "linkedin" | "x" | undefined,
    scheduledAt?: Date | null,
  ): (() => Promise<any>)[] {
    const ops: (() => Promise<any>)[] = [];
    const touchLinkedIn = !platform || platform === "linkedin";
    const touchX = !platform || platform === "x";

    if (touchLinkedIn && post.linkedin?.content?.trim()) {
      const content = post.linkedin.content;
      ops.push(() =>
        this.adapter.upsertLinkedInPost(postId, {
          content,
          status,
          scheduledAt: scheduledAt ?? null,
        }),
      );
    }

    if (touchX && post.x?.posts?.length > 0) {
      const first = post.x.posts[0];
      if (first?.content?.trim()) {
        ops.push(() =>
          this.adapter.upsertXPost(postId, {
            content: first.content,
            mode: post.x.mode || "single",
            threadPosts: post.x.posts,
            status,
            scheduledAt: scheduledAt ?? null,
          }),
        );
      }
    }

    return ops;
  }
}

const prismaAdapter = new PrismaDraftStoreAdapter();
export const draftStore = new DraftStore(prismaAdapter);
