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

function buildPostData(input: z.infer<typeof schedulePostSchema>, existingContent?: any) {
  const title = input.post.baseIdea.trim();
  
  // Merge with existing content if available (preserves other platform's schedule)
  const existing = existingContent || { linkedin: {}, x: {} };
  const platform = input.platform;

  // Preserve existing platform data - only update the platform being scheduled
  const updatedContent = {
    ...input.post,
    model: input.model,
    linkedin: platform === "x"
      ? existing.linkedin
      : { ...existing.linkedin, status: "SCHEDULED", scheduledAt: input.scheduledAt },
    x: platform === "linkedin"
      ? existing.x
      : { ...existing.x, status: "SCHEDULED", scheduledAt: input.scheduledAt },
  };

  return {
    title,
    clientDraftKey: input.clientDraftKey,
    content: updatedContent,
    // Update platform-specific statuses only
    linkedinStatus: updatedContent.linkedin.status,
    linkedinScheduledAt: updatedContent.linkedin.scheduledAt ? new Date(updatedContent.linkedin.scheduledAt) : null,
    xStatus: updatedContent.x.status,
    xScheduledAt: updatedContent.x.scheduledAt ? new Date(updatedContent.x.scheduledAt) : null,
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

    console.log("Schedule post payload:", JSON.stringify(parsedBody.data, null, 2));

    const { id, clientDraftKey, updatedAt } = parsedBody.data;

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
          content: true,
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
          content: true,
        },
      });
    }

    const postData = buildPostData(parsedBody.data, existingPost?.content);

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
          content: true,
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
        content: true,
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
