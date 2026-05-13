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
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Determine what to unschedule
    const doUnscheduleLinkedin = !platform || platform === "linkedin";
    const doUnscheduleX = !platform || platform === "x";

    // 3. Update child rows - set status to DRAFT and scheduledAt to null
    // Child rows persist (not deleted)
    const updates: unknown[] = [];

    if (doUnscheduleLinkedin) {
      updates.push(
        prisma.linkedInPost.update({
          where: { postId: id },
          data: {
            status: "DRAFT",
            scheduledAt: null,
          },
        }),
      );
    }

    if (doUnscheduleX) {
      updates.push(
        prisma.xPost.update({
          where: { postId: id },
          data: {
            status: "DRAFT",
            scheduledAt: null,
          },
        }),
      );
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates as never[]);
    }

    // 4. Fetch updated child rows for response
    const [linkedInPost, xPost] = await Promise.all([
      doUnscheduleLinkedin ? prisma.linkedInPost.findUnique({ where: { postId: id } }) : null,
      doUnscheduleX ? prisma.xPost.findUnique({ where: { postId: id } }) : null,
    ]);

    return NextResponse.json({
      id: post.id,
      linkedinPost: linkedInPost ? {
        id: linkedInPost.id,
        content: linkedInPost.content,
        status: linkedInPost.status,
        scheduledAt: linkedInPost.scheduledAt,
      } : null,
      xPost: xPost ? {
        id: xPost.id,
        content: xPost.content,
        mode: xPost.mode,
        threadPosts: xPost.threadPosts,
        status: xPost.status,
        scheduledAt: xPost.scheduledAt,
      } : null,
    });
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
