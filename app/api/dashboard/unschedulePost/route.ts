import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

import { unscheduleSchema } from "@/lib/schemas/post.schema";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsedBody = unscheduleSchema.safeParse(json);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, platform } = parsedBody.data;

    // 1. Find the post and make sure it belongs to the user
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: authUser.id,
      },
      select: {
        id: true,
        content: true,
        linkedinStatus: true,
        linkedinScheduledAt: true,
        xStatus: true,
        xScheduledAt: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Get existing content and preserve the other platform
    const existingContent = post.content as any;
    const updatedContent = { ...existingContent };
    
    // Only clear the platform being unscheduled, preserve other
    const doUnscheduleLinkedin = !platform || platform === "linkedin";
    const doUnscheduleX = !platform || platform === "x";

    if (doUnscheduleLinkedin) {
      updatedContent.linkedin = { ...existingContent.linkedin, status: "DRAFT", scheduledAt: null };
    }
    if (doUnscheduleX) {
      updatedContent.x = { ...existingContent.x, status: "DRAFT", scheduledAt: null };
    }

    // 4. Update post - platform statuses only
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: updatedContent,
        linkedinStatus: updatedContent.linkedin.status,
        linkedinScheduledAt: doUnscheduleLinkedin ? null : post.linkedinScheduledAt,
        xStatus: updatedContent.x.status,
        xScheduledAt: doUnscheduleX ? null : post.xScheduledAt,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("unschedulePost POST route error", error);
    return NextResponse.json(
      {
        error: "Failed to unschedule post",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
