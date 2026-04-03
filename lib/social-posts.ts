import { z } from "zod";

export const xThreadPostSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
});

export const generatedPostItemSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  baseIdea: z.string().min(1),
  linkedin: z.object({
    content: z.string().min(1),
  }),
  x: z.object({
    mode: z.enum(["single", "thread"]),
    posts: z.array(xThreadPostSchema).min(1),
  }),
});

export const generatedPostPackSchema = z.object({
  posts: z.array(generatedPostItemSchema).min(1),
  model: z.string().min(1),
});

export type XThreadPost = z.infer<typeof xThreadPostSchema>;
export type GeneratedPostItem = z.infer<typeof generatedPostItemSchema>;
export type GeneratedPostPack = z.infer<typeof generatedPostPackSchema>;
