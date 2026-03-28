import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

const generatePostSchema = z.object({
  modelName: z.string().min(1).default("openrouter/free"),
  platform: z.enum(["linkedin", "x"]),
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

  return `
Create a social media post for ${input.platform}.

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
- Keep the post ready to publish.
- Match the conventions of ${input.platform}.
- Make the opening line strong.
- Naturally incorporate the provided keywords when relevant.
- Do not include explanations, labels, or markdown fences.
`.trim();
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();
    console.log("generatePost hit");

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
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

    const openrouter = createOpenRouter({ apiKey });
    const input = parsedBody.data;

    const result = await generateText({
      model: openrouter(input.modelName),
      prompt: buildPrompt(input, {
        accountName: user.accountName,
        accountType: user.accountType ?? null,
        industry: user.industry,
        description: user.description,
      }),
    });

    return NextResponse.json({
      post: result.text,
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
