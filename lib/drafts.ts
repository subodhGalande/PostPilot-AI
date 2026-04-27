import { z } from "zod";

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
};

type SaveDraftPayload = {
  clientDraftKey: string;
  post: GeneratedPostItem;
  model: string;
  id?: string;
  updatedAt?: string;
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

export function mapStoredDraftToGeneratedPostPack(
  content: StoredDraftContent,
): GeneratedPostPack {
  return {
    posts: [
      generatedPostItemSchema.parse({
        topic: content.topic,
        baseIdea: content.baseIdea,
        linkedin: content.linkedin,
        x: content.x,
      }),
    ],
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

    throw new Error(
      errorBody?.message ?? errorBody?.error ?? "Failed to save draft.",
    );
  }

  return response.json();
}
