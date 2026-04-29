import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

const unscheduleSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
});

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

    const { id } = parsedBody.data;

    // 1. Find the post and make sure it belongs to the user
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: authUser.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Update post to DRAFT and remove the scheduled date
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: "DRAFT",
        scheduledAt: null,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
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
