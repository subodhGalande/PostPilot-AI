import { z } from "zod";

export const xThreadPostSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1),
});

export const postStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
  "DELETED",
]);

export const platformLifecycleSchema = z.object({
  status: postStatusSchema.default("DRAFT"),
  scheduledAt: z.string().datetime().nullable().default(null),
});

export const generatedPostItemSchema = z.object({
  topic: z.string().min(1),
  baseIdea: z.string().min(1),
  linkedin: z
    .object({
      content: z.string().optional(),
    })
    .merge(platformLifecycleSchema),
  x: z
    .object({
      mode: z.enum(["single", "thread"]).optional(),
      posts: z.array(xThreadPostSchema).optional().default([]),
    })
    .merge(platformLifecycleSchema),
});

export const generatedPostPackSchema = z.object({
  post: generatedPostItemSchema,
  model: z.string().min(1),
});

export type XThreadPost = z.infer<typeof xThreadPostSchema>;
export type GeneratedPostItem = z.infer<typeof generatedPostItemSchema>;
export type GeneratedPostPack = z.infer<typeof generatedPostPackSchema>;
