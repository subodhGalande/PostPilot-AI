import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

type DraftPostStatus = "DRAFT" | "SCHEDULED";
type JsonArray = Prisma.InputJsonValue[];

export interface PostMeta {
  id: string;
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformChildData {
  id: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
}

export interface XPostChildData extends PlatformChildData {
  mode: string | null;
  threadPosts: unknown;
}

export interface PostWithChildren {
  id: string;
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  linkedinPost: PlatformChildData | null;
  xPost: XPostChildData | null;
}

export interface CreatePostInput {
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string;
  userId: string;
}

export interface UpdatePostInput {
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string;
}

export interface UpsertLinkedInInput {
  content: string;
  status: string;
  scheduledAt: Date | null;
}

export interface UpsertXInput {
  content: string;
  mode: string;
  threadPosts: unknown;
  status: string;
  scheduledAt: Date | null;
}

export interface UpdateChildStatusInput {
  status: string;
  scheduledAt: Date | null;
}

export interface DraftStoreAdapter {
  findPostMeta(
    userId: string,
    id?: string,
    clientDraftKey?: string,
  ): Promise<PostMeta | null>;
  findPostWithChildren(
    userId: string,
    id: string,
  ): Promise<PostWithChildren | null>;
  findPostsByUser(userId: string, status: string): Promise<PostWithChildren[]>;
  createPost(input: CreatePostInput): Promise<PostMeta>;
  updatePost(id: string, input: UpdatePostInput): Promise<void>;
  deletePost(id: string): Promise<void>;
  upsertLinkedInPost(postId: string, input: UpsertLinkedInInput): Promise<void>;
  upsertXPost(postId: string, input: UpsertXInput): Promise<void>;
  updateLinkedInPost(
    postId: string,
    input: UpdateChildStatusInput,
  ): Promise<void>;
  updateXPost(postId: string, input: UpdateChildStatusInput): Promise<void>;
  deleteLinkedInPost(postId: string): Promise<void>;
  deleteXPost(postId: string): Promise<void>;
  findChildren(postId: string): Promise<{
    linkedinPost: PlatformChildData | null;
    xPost: XPostChildData | null;
  }>;
  batch(operations: (() => Promise<unknown>)[]): Promise<unknown[]>;
}

export class PrismaDraftStoreAdapter implements DraftStoreAdapter {
  async findPostMeta(
    userId: string,
    id?: string,
    clientDraftKey?: string,
  ): Promise<PostMeta | null> {
    if (id) {
      const res = await prisma.post.findFirst({
        where: { id, userId },
        select: {
          id: true,
          title: true,
          topic: true,
          baseIdea: true,
          model: true,
          clientDraftKey: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!res) return null;
      return {
        ...res,
        topic: res.topic || "",
        baseIdea: res.baseIdea || "",
        model: res.model || "",
      };
    }
    if (clientDraftKey) {
      const res = await prisma.post.findFirst({
        where: { userId, clientDraftKey },
        select: {
          id: true,
          title: true,
          topic: true,
          baseIdea: true,
          model: true,
          clientDraftKey: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!res) return null;
      return {
        ...res,
        topic: res.topic || "",
        baseIdea: res.baseIdea || "",
        model: res.model || "",
      };
    }
    return null;
  }

  async findPostWithChildren(
    userId: string,
    id: string,
  ): Promise<PostWithChildren | null> {
    const result = await prisma.post.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        topic: true,
        baseIdea: true,
        model: true,
        clientDraftKey: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        linkedinPost: {
          select: {
            id: true,
            content: true,
            status: true,
            scheduledAt: true,
          },
        },
        xPost: {
          select: {
            id: true,
            content: true,
            mode: true,
            threadPosts: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
    });
    if (!result) return null;
    return {
      ...result,
      topic: result.topic || "",
      baseIdea: result.baseIdea || "",
      model: result.model || "",
    } as PostWithChildren;
  }

  async findPostsByUser(
    userId: string,
    status: string,
  ): Promise<PostWithChildren[]> {
    const results = await prisma.post.findMany({
      where: {
        userId,
        OR: [
          { linkedinPost: { status: status as DraftPostStatus } },
          { xPost: { status: status as DraftPostStatus } },
        ],
      },
      select: {
        id: true,
        title: true,
        topic: true,
        baseIdea: true,
        model: true,
        clientDraftKey: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        linkedinPost: {
          select: {
            id: true,
            content: true,
            status: true,
            scheduledAt: true,
          },
        },
        xPost: {
          select: {
            id: true,
            content: true,
            mode: true,
            threadPosts: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return results as unknown as PostWithChildren[];
  }

  async createPost(input: CreatePostInput): Promise<PostMeta> {
    const res = await prisma.post.create({
      data: input,
      select: {
        id: true,
        title: true,
        topic: true,
        baseIdea: true,
        model: true,
        clientDraftKey: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      ...res,
      topic: res.topic || "",
      baseIdea: res.baseIdea || "",
      model: res.model || "",
    };
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: input,
    });
  }

  async deletePost(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } });
  }

  async upsertLinkedInPost(
    postId: string,
    input: UpsertLinkedInInput,
  ): Promise<void> {
    await prisma.linkedInPost.upsert({
      where: { postId },
      update: {
        content: input.content,
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
      create: {
        postId,
        content: input.content,
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
    });
  }

  async upsertXPost(postId: string, input: UpsertXInput): Promise<void> {
    await prisma.xPost.upsert({
      where: { postId },
      update: {
        content: input.content,
        mode: input.mode,
        threadPosts: input.threadPosts as JsonArray,
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
      create: {
        postId,
        content: input.content,
        mode: input.mode,
        threadPosts: input.threadPosts as JsonArray,
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
    });
  }

  async updateLinkedInPost(
    postId: string,
    input: UpdateChildStatusInput,
  ): Promise<void> {
    await prisma.linkedInPost.update({
      where: { postId },
      data: {
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
    });
  }

  async updateXPost(
    postId: string,
    input: UpdateChildStatusInput,
  ): Promise<void> {
    await prisma.xPost.update({
      where: { postId },
      data: {
        status: input.status as DraftPostStatus,
        scheduledAt: input.scheduledAt,
      },
    });
  }

  async deleteLinkedInPost(postId: string): Promise<void> {
    await prisma.linkedInPost.delete({ where: { postId } });
  }

  async deleteXPost(postId: string): Promise<void> {
    await prisma.xPost.delete({ where: { postId } });
  }

  async findChildren(postId: string): Promise<{
    linkedinPost: PlatformChildData | null;
    xPost: XPostChildData | null;
  }> {
    const [linkedinPost, xPost] = await Promise.all([
      prisma.linkedInPost.findUnique({
        where: { postId },
        select: {
          id: true,
          content: true,
          status: true,
          scheduledAt: true,
        },
      }),
      prisma.xPost.findUnique({
        where: { postId },
        select: {
          id: true,
          content: true,
          mode: true,
          threadPosts: true,
          status: true,
          scheduledAt: true,
        },
      }),
    ]);
    return { linkedinPost, xPost };
  }

  async batch(operations: (() => Promise<unknown>)[]): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const op of operations) {
      results.push(await op());
    }
    return results;
  }
}

interface StoredPost {
  id: string;
  title: string;
  topic: string;
  baseIdea: string;
  model: string;
  clientDraftKey: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredChild {
  id: string;
  postId: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
  mode?: string | null;
  threadPosts?: unknown;
}

export class InMemoryDraftStoreAdapter implements DraftStoreAdapter {
  private posts = new Map<string, StoredPost>();
  private linkedInPosts = new Map<string, StoredChild>();
  private xPosts = new Map<string, StoredChild>();
  private nextId = 1;

  private genId(): string {
    return `mem-${this.nextId++}`;
  }

  reset(): void {
    this.posts.clear();
    this.linkedInPosts.clear();
    this.xPosts.clear();
    this.nextId = 1;
  }

  async findPostMeta(
    userId: string,
    id?: string,
    clientDraftKey?: string,
  ): Promise<PostMeta | null> {
    let post: StoredPost | undefined;
    if (id) {
      post = this.findPostById(id);
    } else if (clientDraftKey) {
      post = this.findPostByClientDraftKey(clientDraftKey);
    }
    if (!post || post.userId !== userId) return null;
    return this.toPostMeta(post);
  }

  async findPostWithChildren(
    userId: string,
    id: string,
  ): Promise<PostWithChildren | null> {
    const post = this.posts.get(id);
    if (!post || post.userId !== userId) return null;
    return {
      ...this.toPostMeta(post),
      linkedinPost: this.getLinkedInForPost(id),
      xPost: this.getXForPost(id),
    };
  }

  async findPostsByUser(
    userId: string,
    status: string,
  ): Promise<PostWithChildren[]> {
    const results: PostWithChildren[] = [];
    for (const post of this.posts.values()) {
      if (post.userId !== userId) continue;
      const li = this.getLinkedInForPost(post.id);
      const x = this.getXForPost(post.id);
      if ((li && li.status === status) || (x && x.status === status)) {
        results.push({ ...this.toPostMeta(post), linkedinPost: li, xPost: x });
      }
    }
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results;
  }

  async createPost(input: CreatePostInput): Promise<PostMeta> {
    const id = this.genId();
    const now = new Date();
    const post: StoredPost = {
      id,
      title: input.title,
      topic: input.topic,
      baseIdea: input.baseIdea,
      model: input.model,
      clientDraftKey: input.clientDraftKey,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(id, post);
    return this.toPostMeta(post);
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<void> {
    const post = this.posts.get(id);
    if (!post) throw new Error(`Post ${id} not found`);
    post.title = input.title;
    post.topic = input.topic;
    post.baseIdea = input.baseIdea;
    post.model = input.model;
    post.clientDraftKey = input.clientDraftKey;
    post.updatedAt = new Date();
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
    this.deleteChildrenByPostId(id);
  }

  async upsertLinkedInPost(
    postId: string,
    input: UpsertLinkedInInput,
  ): Promise<void> {
    const existing = this.findLinkedInByPostId(postId);
    if (existing) {
      existing.content = input.content;
      existing.status = input.status;
      existing.scheduledAt = input.scheduledAt;
    } else {
      const child: StoredChild = {
        id: this.genId(),
        postId,
        content: input.content,
        status: input.status,
        scheduledAt: input.scheduledAt,
      };
      this.linkedInPosts.set(child.id, child);
    }
  }

  async upsertXPost(postId: string, input: UpsertXInput): Promise<void> {
    const existing = this.findXByPostId(postId);
    if (existing) {
      existing.content = input.content;
      existing.mode = input.mode;
      existing.threadPosts = input.threadPosts;
      existing.status = input.status;
      existing.scheduledAt = input.scheduledAt;
    } else {
      const child: StoredChild = {
        id: this.genId(),
        postId,
        content: input.content,
        mode: input.mode,
        threadPosts: input.threadPosts,
        status: input.status,
        scheduledAt: input.scheduledAt,
      };
      this.xPosts.set(child.id, child);
    }
  }

  async updateLinkedInPost(
    postId: string,
    input: UpdateChildStatusInput,
  ): Promise<void> {
    const existing = this.findLinkedInByPostId(postId);
    if (!existing) throw new Error(`LinkedIn post for ${postId} not found`);
    existing.status = input.status;
    existing.scheduledAt = input.scheduledAt;
  }

  async updateXPost(
    postId: string,
    input: UpdateChildStatusInput,
  ): Promise<void> {
    const existing = this.findXByPostId(postId);
    if (!existing) throw new Error(`X post for ${postId} not found`);
    existing.status = input.status;
    existing.scheduledAt = input.scheduledAt;
  }

  async deleteLinkedInPost(postId: string): Promise<void> {
    const entry = this.findLinkedInEntryByPostId(postId);
    if (entry) this.linkedInPosts.delete(entry[0]);
  }

  async deleteXPost(postId: string): Promise<void> {
    const entry = this.findXEntryByPostId(postId);
    if (entry) this.xPosts.delete(entry[0]);
  }

  async findChildren(postId: string): Promise<{
    linkedinPost: PlatformChildData | null;
    xPost: XPostChildData | null;
  }> {
    return {
      linkedinPost: this.getLinkedInForPost(postId),
      xPost: this.getXForPost(postId),
    };
  }

  async batch(operations: (() => Promise<unknown>)[]): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const op of operations) {
      results.push(await op());
    }
    return results;
  }

  private toPostMeta(post: StoredPost): PostMeta {
    return {
      id: post.id,
      title: post.title,
      topic: post.topic,
      baseIdea: post.baseIdea,
      model: post.model,
      clientDraftKey: post.clientDraftKey,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private findPostById(id: string): StoredPost | undefined {
    return this.posts.get(id);
  }

  private findPostByClientDraftKey(key: string): StoredPost | undefined {
    for (const post of this.posts.values()) {
      if (post.clientDraftKey === key) return post;
    }
    return undefined;
  }

  private findLinkedInByPostId(postId: string): StoredChild | undefined {
    for (const child of this.linkedInPosts.values()) {
      if (child.postId === postId) return child;
    }
    return undefined;
  }

  private findLinkedInEntryByPostId(
    postId: string,
  ): [string, StoredChild] | undefined {
    for (const entry of this.linkedInPosts.entries()) {
      if (entry[1].postId === postId) return entry;
    }
    return undefined;
  }

  private findXByPostId(postId: string): StoredChild | undefined {
    for (const child of this.xPosts.values()) {
      if (child.postId === postId) return child;
    }
    return undefined;
  }

  private findXEntryByPostId(
    postId: string,
  ): [string, StoredChild] | undefined {
    for (const entry of this.xPosts.entries()) {
      if (entry[1].postId === postId) return entry;
    }
    return undefined;
  }

  private getLinkedInForPost(postId: string): PlatformChildData | null {
    const child = this.findLinkedInByPostId(postId);
    if (!child) return null;
    return {
      id: child.id,
      content: child.content,
      status: child.status,
      scheduledAt: child.scheduledAt,
    };
  }

  private getXForPost(postId: string): XPostChildData | null {
    const child = this.findXByPostId(postId);
    if (!child) return null;
    return {
      id: child.id,
      content: child.content,
      mode: child.mode ?? null,
      threadPosts: child.threadPosts ?? null,
      status: child.status,
      scheduledAt: child.scheduledAt,
    };
  }

  private deleteChildrenByPostId(postId: string): void {
    for (const [key, child] of this.linkedInPosts.entries()) {
      if (child.postId === postId) this.linkedInPosts.delete(key);
    }
    for (const [key, child] of this.xPosts.entries()) {
      if (child.postId === postId) this.xPosts.delete(key);
    }
  }
}
