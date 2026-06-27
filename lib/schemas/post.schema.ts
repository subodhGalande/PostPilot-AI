import { z } from "zod";
import { generatedPostItemSchema } from "./social.schema";

export const generatePostSchema = z.object({
  modelName: z.string().min(1),
  topic: z.string().min(1, "Topic is required").max(1000, "Topic is too long"),
  tone: z.string().min(1, "Tone is required").max(100, "Tone is too long"),
  postStyle: z
    .string()
    .min(1, "Post style is required")
    .max(100, "Post style is too long"),
  targetAudience: z
    .string()
    .min(1, "Target audience is required")
    .max(200, "Target audience is too long"),
  keywords: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export type GeneratePostPayload = z.infer<typeof generatePostSchema>;

export const saveDraftSchema = z.object({
  id: z.string().optional(),
  clientDraftKey: z.string().min(1, "Client draft key is required"),
  post: generatedPostItemSchema,
  model: z.string().min(1, "Model is required"),
  updatedAt: z.string().datetime().optional(),
  platform: z.enum(["linkedin", "x"]).optional(),
});

export type SaveDraftPayload = z.infer<typeof saveDraftSchema>;

export const schedulePostSchema = z.object({
  id: z.string().optional(),
  clientDraftKey: z.string().min(1, "Client draft key is required"),
  post: generatedPostItemSchema,
  model: z.string().min(1, "Model is required"),
  updatedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime("Scheduled at is required"),
  platform: z.enum(["linkedin", "x"]).optional(),
});

export type SchedulePostPayload = z.infer<typeof schedulePostSchema>;

export const unscheduleSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
  platform: z.enum(["linkedin", "x"]).optional(),
});

export type UnschedulePayload = z.infer<typeof unscheduleSchema>;
