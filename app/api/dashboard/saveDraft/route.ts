import { NextResponse } from "next/server";
import type { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

import { saveDraftSchema } from "@/lib/schemas/post.schema";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save draft";
}

function buildDraftData(input: z.infer<typeof saveDraftSchema>) {
  const { post, model, clientDraftKey, platform } = input;

  const draftData: {
    title: string;
    topic: string;
    baseIdea: string;
    model: string;
    clientDraftKey: string;
    linkedinContent?: { content?: string };
    linkedinStatus?: "DRAFT";
    linkedinScheduledAt?: null;
    xContent?: { mode?: "single" | "thread"; posts: typeof post.x.posts };
    xStatus?: "DRAFT";
    xScheduledAt?: null;
  } = {
    title: post.baseIdea.trim(),
    topic: post.topic,
    baseIdea: post.baseIdea,
    model: model,
    clientDraftKey,
  };

  if (!platform || platform === "linkedin") {
    draftData.linkedinContent = { content: post.linkedin.content };
    draftData.linkedinStatus = "DRAFT";
    draftData.linkedinScheduledAt = null;
  }

  if (!platform || platform === "x") {
    draftData.xContent = { mode: post.x.mode, posts: post.x.posts };
    draftData.xStatus = "DRAFT";
    draftData.xScheduledAt = null;
  }

  return draftData;
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsedBody = saveDraftSchema.safeParse(json);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, clientDraftKey, updatedAt, post } = parsedBody.data;

    // Validate at least one platform has content
    const hasLinkedInContent =
      post.linkedin?.content && post.linkedin.content.trim().length > 0;
    const hasXContent =
      post.x?.posts &&
      post.x.posts.length > 0 &&
      post.x.posts[0]?.content &&
      post.x.posts[0].content.trim().length > 0;

    if (!hasLinkedInContent && !hasXContent) {
      return NextResponse.json(
        { error: "At least one platform must have content" },
        { status: 400 },
      );
    }

    // 1. Try to find existing draft by ID or ClientDraftKey
    let existingDraft = null;

    if (id) {
      existingDraft = await prisma.post.findFirst({
        where: {
          id,
          userId: authUser.id,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });
    } else {
      existingDraft = await prisma.post.findFirst({
        where: {
          userId: authUser.id,
          clientDraftKey,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });
    }

    const draftData = buildDraftData(parsedBody.data);

    // 2. If draft exists, check for conflicts and update
    if (existingDraft) {
      if (updatedAt && existingDraft.updatedAt.toISOString() !== updatedAt) {
        return NextResponse.json(
          {
            error: "Draft conflict",
            message:
              "This draft was updated in another tab. Refresh before saving again.",
            currentUpdatedAt: existingDraft.updatedAt.toISOString(),
          },
          { status: 409 },
        );
      }

      const updatedDraft = await prisma.post.update({
        where: {
          id: existingDraft.id,
        },
        data: draftData,
        select: {
          id: true,
          title: true,
          topic: true,
          baseIdea: true,
          model: true,
          linkedinContent: true,
          xContent: true,
          linkedinStatus: true,
          linkedinScheduledAt: true,
          xStatus: true,
          xScheduledAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ ...updatedDraft, platform: parsedBody.data.platform });
    }

    // 3. If no draft exists, create a new one
    const newDraft = await prisma.post.create({
      data: {
        ...draftData,
        userId: authUser.id,
      },
      select: {
        id: true,
        title: true,
        topic: true,
        baseIdea: true,
        model: true,
        linkedinContent: true,
        xContent: true,
        linkedinStatus: true,
        linkedinScheduledAt: true,
        xStatus: true,
        xScheduledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ...newDraft, platform: parsedBody.data.platform }, { status: 201 });
  } catch (error) {
    console.error("saveDraft POST route error", error);

    return NextResponse.json(
      {
        error: "Failed to save draft",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
