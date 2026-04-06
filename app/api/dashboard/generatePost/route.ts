import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

const generatePostSchema = z.object({
  modelName: z.string().min(1).default("gemini-2.5-flash"),
  topic: z.string().min(1, "Topic is required"),
  tone: z.string().min(1, "Tone is required"),
  postStyle: z.string().min(1, "Post style is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  keywords: z.array(z.string().min(1)).default([]),
});

function buildPrompt(
  input: z.infer<typeof generatePostSchema>,
  user: {
    accountName: string | null;
    accountType: string | null;
    industry: string | null;
    description: string | null;
  },
) {
  const keywordLine =
    input.keywords.length > 0 ? input.keywords.join(", ") : "None provided";
  const shouldPreferThread = ["long-form", "listicle", "educational"].includes(
    input.postStyle.toLowerCase(),
  );

  return `
Create one social post idea and adapt it for both LinkedIn and X.

Topic: ${input.topic}
Tone: ${input.tone}
Style: ${input.postStyle}
Target audience: ${input.targetAudience}
Keywords: ${keywordLine}

Author profile:
- Account name: ${user.accountName ?? "Unknown"}
- Account type: ${user.accountType ?? "Unknown"}
- Industry: ${user.industry ?? "Unknown"}
- Description: ${user.description ?? "Unknown"}

Requirements:
- Return one post package that keeps the same core message across platforms.
- LinkedIn should be one polished plain-text post, already formatted and ready to paste directly into LinkedIn.
- LinkedIn must start with a strong hook in the very first line.
- LinkedIn should use clear paragraphs, intentional line breaks, and numbered or unordered lists when they improve readability.
- LinkedIn formatting should feel native to LinkedIn, not like a dense wall of text.
- Do not use em dashes or other long dashes.
- The writing should feel human, specific, and natural, not generic or AI-generated.
- Use creative writing where it improves the post, while keeping it publish-ready and believable.
- X must be optimized for X-native readability, not just shortened LinkedIn text.
- ${
    shouldPreferThread
      ? "For this request, strongly prefer an X thread unless the idea is completely clear in a single post under 240 characters."
      : "Use a single X post only when the idea feels complete, punchy, and natural under 240 characters."
  }
- Convert X into multiple thread posts whenever a single post would feel cramped, rushed, or incomplete.
- Each X post must be concise, stand on its own while still flowing as a thread, and stay under 240 characters.
- Use strong paragraph spacing and line breaks where they improve readability.
- Use emojis more frequently when they improve readability, emphasis, or reach.
- Make the post feel more impactful with tasteful emoji usage, while keeping it natural and platform-appropriate.
- Prefer placing emojis in hooks, short lists, and key takeaways rather than scattering them everywhere.
- Do not include labels like "LinkedIn Post", "Tweet 1", or markdown fences.
- Make the opening strong for both platforms.
- Naturally incorporate the provided keywords when relevant.
- If hashtags are used, place them at the very end of the post after the full content, with exactly two empty lines before the hashtag line.
- Keep all hashtags together on the final line or final hashtag block only. Do not scatter hashtags inside the main content.
- Do not add explanations outside the schema.
- Use these exact ids:
  - post id: "post-1"
  - if X is a single post, use x post id: "x-1"
  - if X is a thread, use sequential ids like "x-1", "x-2", "x-3"
- baseIdea should summarize the shared message in one sentence.

Plain-text formatting rules for LinkedIn:
- Output plain text only.
- Do not output HTML.
- Do not output markdown syntax like **bold**, __underline__, # headings, or code fences.
- The LinkedIn post must feel finished and publish-ready, not like a draft.
- The first line must be a short hook, ideally under 12 words.
- Separate paragraphs with exactly one empty line.
- Keep most paragraphs to 1 to 3 sentences max.
- Avoid dense blocks of text.
- Remove filler setup lines like "Let's break it down", "Here is what this looks like", or similar transitions.
- Do not use separators like "---".
- LinkedIn posts should normally include relevant emojis to increase impact and scannability.
- Unless the topic is highly sensitive, legal, or crisis-related, include at least 2 relevant emojis in the LinkedIn post.
- Prefer using emojis in the hook, key bullet points, or closing CTA where they add emphasis naturally.
- If using bullets, each bullet must start with "• " and each bullet must be on its own line.
- Use bullets only when they genuinely improve scannability.
- Keep each bullet concise, ideally 1 to 2 sentences.
- If using numbered items, each item must start with "1. ", "2. ", "3. " and each item must be on its own line.
- Do not add extra empty lines inside a list.
- Do not put labels like "Hook:", "CTA:", or "Takeaway:" in the post.
- End with one short closing thought or CTA.
- Aim for roughly 120 to 200 words unless the requested style clearly needs shorter copy.
- Before finalizing, self-edit for scannability and shorten any paragraph that feels too long.

Plain-text formatting rules for X:
- Output plain text only.
- Do not output HTML.
- Do not output markdown syntax like **bold**, __underline__, # headings, or code fences.
- Each x.posts[].content must already be perfectly formatted plain text.
- Prefer 2 to 5 thread posts when the topic benefits from explanation, examples, or a list.
- For long-form, listicle, or educational posts, thread mode is usually the right choice.
- The first X post should open with a sharp hook.
- X should use emojis more freely than LinkedIn to boost impact and attention, but keep them intentional and avoid spammy repetition.
- Each follow-up X post should add one clear idea, example, or takeaway.
- Do not cram multiple major ideas into a single X post just to avoid a thread.
- Separate paragraphs with exactly one empty line only when needed for readability.
- If using bullets, each bullet must start with "• " and each bullet must be on its own line.
- If using numbered items, each item must start with "1. ", "2. ", "3. " and each item must be on its own line.
- Each x.posts[].content must remain under 240 characters total.
- Split into another thread post before exceeding 240 characters.
- The thread should read naturally from one post to the next, but each post should also make sense on its own.
- If there is any doubt, choose a thread over an overcrowded single post.

Formatting examples:
- Good LinkedIn paragraph spacing:
Short first line hook

Second paragraph here.

Third paragraph here.

- Good bullet formatting:
• First point
• Second point

- Good numbered formatting:
1. First step
2. Second step

- Good X thread shape:
x-1 = strong hook
x-2 = one supporting idea
x-3 = one example or takeaway
`.trim();
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY is not configured",
        },
        { status: 500 },
      );
    }

    const json = await req.json();
    const parsedBody = generatePostSchema.safeParse(json);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        accountName: true,
        accountType: true,
        industry: true,
        description: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const input = parsedBody.data;

    const result = await generateObject({
      model: google(input.modelName),
      schema: generatedPostItemSchema,
      prompt: buildPrompt(input, {
        accountName: user.accountName,
        accountType: user.accountType ?? null,
        industry: user.industry,
        description: user.description,
      }),
    });

    return NextResponse.json({
      posts: [result.object],
      model: input.modelName,
    });
  } catch (error) {
    console.error("generatePost route error", error);

    return NextResponse.json(
      { error: "Failed to generate post" },
      { status: 500 },
    );
  }
}
