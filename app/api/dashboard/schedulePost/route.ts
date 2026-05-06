import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

import { schedulePostSchema } from "@/lib/schemas/post.schema";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to schedule post";
}

function buildPostData(
  input: z.infer<typeof schedulePostSchema>,
  existingPost?: any,
) {
  const { post, model, clientDraftKey, platform, scheduledAt } = input;

  const linkedinStatus =
    platform === "linkedin"
      ? "SCHEDULED"
      : existingPost?.linkedinStatus || "DRAFT";
  const linkedinScheduledAt =
    platform === "linkedin"
      ? new Date(scheduledAt)
      : existingPost?.linkedinScheduledAt;

  const xStatus =
    platform === "x" ? "SCHEDULED" : existingPost?.xStatus || "DRAFT";
  const xScheduledAt =
    platform === "x" ? new Date(scheduledAt) : existingPost?.xScheduledAt;

  return {
    title: post.baseIdea.trim(),
    topic: post.topic,
    baseIdea: post.baseIdea,
    model: model,
    clientDraftKey,

    // Platform Content (stripped of metadata)
    linkedinContent: { content: post.linkedin.content },
    xContent: { mode: post.x.mode, posts: post.x.posts },

    // Single Source of Truth for Status
    linkedinStatus: linkedinStatus as any,
    linkedinScheduledAt,
    xStatus: xStatus as any,
    xScheduledAt,
  };
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsedBody = schedulePostSchema.safeParse(json);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    console.log(
      "Schedule post payload:",
      JSON.stringify(parsedBody.data, null, 2),
    );

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

    // 1. Try to find existing post by ID or ClientDraftKey
    let existingPost = null;

    if (id) {
      existingPost = await prisma.post.findFirst({
        where: {
          id,
          userId: authUser.id,
        },
        select: {
          id: true,
          updatedAt: true,
          linkedinStatus: true,
          linkedinScheduledAt: true,
          xStatus: true,
          xScheduledAt: true,
        },
      });
    } else {
      existingPost = await prisma.post.findFirst({
        where: {
          userId: authUser.id,
          clientDraftKey,
        },
        select: {
          id: true,
          updatedAt: true,
          linkedinStatus: true,
          linkedinScheduledAt: true,
          xStatus: true,
          xScheduledAt: true,
        },
      });
    }

    const postData = buildPostData(parsedBody.data, existingPost);

    // 2. If post exists, check for conflicts and update to SCHEDULED
    if (existingPost) {
      if (updatedAt && existingPost.updatedAt.toISOString() !== updatedAt) {
        return NextResponse.json(
          {
            error: "Post conflict",
            message:
              "This post was updated in another tab. Refresh before scheduling.",
            currentUpdatedAt: existingPost.updatedAt.toISOString(),
          },
          { status: 409 },
        );
      }

      const updatedPost = await prisma.post.update({
        where: {
          id: existingPost.id,
        },
        data: postData,
        select: {
          id: true,
          title: true,
          topic: true,
          baseIdea: true,
          model: true,
          linkedinContent: true,
          xContent: true,
          createdAt: true,
          updatedAt: true,
          clientDraftKey: true,
          linkedinStatus: true,
          linkedinScheduledAt: true,
          xStatus: true,
          xScheduledAt: true,
        },
      });

      return NextResponse.json(updatedPost);
    }

    // 3. If no post exists, create a new one as SCHEDULED
    const newPost = await prisma.post.create({
      data: {
        ...postData,
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
        createdAt: true,
        updatedAt: true,
        clientDraftKey: true,
        linkedinStatus: true,
        linkedinScheduledAt: true,
        xStatus: true,
        xScheduledAt: true,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("schedulePost POST route error", error);

    return NextResponse.json(
      {
        error: "Failed to schedule post",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
