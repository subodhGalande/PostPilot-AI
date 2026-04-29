import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

const schedulePostSchema = z.object({
  id: z.string().optional(),
  clientDraftKey: z.string().min(1, "Client draft key is required"),
  post: generatedPostItemSchema,
  model: z.string().min(1, "Model is required"),
  updatedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime("Scheduled at is required"),
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to schedule post";
}

function buildPostData(input: z.infer<typeof schedulePostSchema>) {
  const title = input.post.baseIdea.trim();

  return {
    title,
    clientDraftKey: input.clientDraftKey,
    content: {
      ...input.post,
      model: input.model,
    },
    status: "SCHEDULED" as const,
    scheduledAt: new Date(input.scheduledAt),
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
        },
      });
    }

    const postData = buildPostData(parsedBody.data);

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
          status: true,
          createdAt: true,
          updatedAt: true,
          scheduledAt: true,
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
        status: true,
        createdAt: true,
        updatedAt: true,
        scheduledAt: true,
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
