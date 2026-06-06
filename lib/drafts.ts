import { z } from "zod";

import { ApiError } from "./errors";
import {
  generatedPostItemSchema,
  type GeneratedPostItem,
  type GeneratedPostPack,
} from "@/lib/social-posts";

export const storedDraftContentSchema = generatedPostItemSchema.extend({
  model: z.string().min(1),
});

export type StoredDraftContent = z.infer<typeof storedDraftContentSchema>;

export type SaveDraftResponse = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  platform?: "linkedin" | "x";
  content?: StoredDraftContent;
  linkedinPost?: {
    id: string;
    content: string | null;
    status: string;
    scheduledAt: Date | null;
  } | null;
  xPost?: {
    id: string;
    content: string | null;
    mode: string | null;
    threadPosts: unknown;
    status: string;
    scheduledAt: Date | null;
  } | null;
};

type SaveDraftPayload = {
  clientDraftKey: string;
  post: GeneratedPostItem;
  model: string;
  id?: string;
  updatedAt?: string;
  platform?: "linkedin" | "x";
};

export type SchedulePostPayload = SaveDraftPayload & {
  scheduledAt: string;
  platform?: "linkedin" | "x";
};

export function createClientDraftKey() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function parseStoredDraftContent(content: unknown) {
  return storedDraftContentSchema.parse(content);
}

type ReconstructPostInput = {
  linkedinPost?: {
    content?: string | null;
    status?: string;
    scheduledAt?: Date | string | null;
  } | null;
  xPost?: {
    mode?: string;
    threadPosts?: unknown[];
    status?: string;
    scheduledAt?: Date | string | null;
  } | null;
  topic?: string;
  baseIdea?: string;
  model?: string;
};

export function reconstructPostContent(
  post: ReconstructPostInput,
): StoredDraftContent {
  const linkedin = post.linkedinPost || {
    content: null,
    status: "DRAFT",
    scheduledAt: null,
  };
  const xPost = post.xPost || {
    mode: "single",
    threadPosts: [],
    status: "DRAFT",
    scheduledAt: null,
  };

  return storedDraftContentSchema.parse({
    topic: post.topic || "",
    baseIdea: post.baseIdea || "",
    model: post.model || "",
    linkedin: {
      content: linkedin.content || "",
      status: linkedin.status,
      scheduledAt:
        linkedin.scheduledAt instanceof Date
          ? linkedin.scheduledAt.toISOString()
          : linkedin.scheduledAt || null,
    },
    x: {
      mode: xPost.mode || "single",
      posts: xPost.threadPosts || [],
      status: xPost.status,
      scheduledAt:
        xPost.scheduledAt instanceof Date
          ? xPost.scheduledAt.toISOString()
          : xPost.scheduledAt || null,
    },
  });
}

export function mapStoredDraftToGeneratedPostPack(
  content: StoredDraftContent,
): GeneratedPostPack {
  return {
    post: generatedPostItemSchema.parse({
      topic: content.topic,
      baseIdea: content.baseIdea,
      linkedin: content.linkedin,
      x: content.x,
    }),
    model: content.model,
  };
}

export async function saveDraft(
  payload: SaveDraftPayload,
): Promise<SaveDraftResponse> {
  const response = await fetch("/api/dashboard/saveDraft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    throw new ApiError(
      errorBody?.message ?? errorBody?.error ?? "Failed to save draft.",
      response.status,
    );
  }

  return response.json();
}

export async function schedulePost(
  payload: SchedulePostPayload,
): Promise<SaveDraftResponse> {
  const response = await fetch("/api/dashboard/schedulePost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    throw new ApiError(
      errorBody?.message ?? errorBody?.error ?? "Failed to schedule post.",
      response.status,
    );
  }

  return response.json();
}
