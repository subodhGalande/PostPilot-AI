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

function buildPostData(input: z.infer<typeof saveDraftSchema>) {
  const { post, model, clientDraftKey } = input;

  return {
    title: post.baseIdea.trim(),
    topic: post.topic,
    baseIdea: post.baseIdea,
    model: model,
    clientDraftKey,
  };
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
          createdAt: true,
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
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    const postData = buildPostData(parsedBody.data);
    const { platform } = parsedBody.data;
    const createLinkedIn = !platform || platform === "linkedin";
    const createX = !platform || platform === "x";

    const buildChildRowUpdates = async (postId: string) => {
      const updates: unknown[] = [];

      if (createLinkedIn && post.linkedin?.content?.trim()) {
        updates.push(
          prisma.linkedInPost.upsert({
            where: { postId },
            update: {
              content: post.linkedin.content,
              status: "DRAFT",
              scheduledAt: null,
            },
            create: {
              content: post.linkedin.content,
              status: "DRAFT",
              scheduledAt: null,
              postId,
            },
          }),
        );
      }

      if (createX && post.x?.posts?.length > 0) {
        const firstPost = post.x.posts[0];
        if (firstPost?.content?.trim()) {
          updates.push(
            prisma.xPost.upsert({
              where: { postId },
              update: {
                content: firstPost.content,
                mode: post.x.mode || "single",
                threadPosts: post.x.posts,
                status: "DRAFT",
                scheduledAt: null,
              },
              create: {
                content: firstPost.content,
                mode: post.x.mode || "single",
                threadPosts: post.x.posts,
                status: "DRAFT",
                scheduledAt: null,
                postId,
              },
            }),
          );
        }
      }

      return updates;
    };

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

      const childUpdates = await buildChildRowUpdates(existingDraft.id);
      const [updatedPost] = (await prisma.$transaction([
        prisma.post.update({
          where: { id: existingDraft.id },
          data: postData,
          select: {
            id: true,
            updatedAt: true,
            createdAt: true,
          },
        }),
        ...childUpdates,
      ] as any[])) as [any, ...any[]];


      const [updatedLinkedIn, updatedX] = await Promise.all([
        prisma.linkedInPost.findUnique({ where: { postId: existingDraft.id } }),
        prisma.xPost.findUnique({ where: { postId: existingDraft.id } }),
      ]);

      return NextResponse.json({
        id: updatedPost.id,
        ...postData,
        linkedinPost: updatedLinkedIn
          ? {
              id: updatedLinkedIn.id,
              content: updatedLinkedIn.content,
              status: updatedLinkedIn.status,
              scheduledAt: updatedLinkedIn.scheduledAt,
            }
          : null,
        xPost: updatedX
          ? {
              id: updatedX.id,
              content: updatedX.content,
              mode: updatedX.mode,
              threadPosts: updatedX.threadPosts,
              status: updatedX.status,
              scheduledAt: updatedX.scheduledAt,
            }
          : null,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt.toISOString(),
      });
    }

    // 3. If no draft exists, create a new one
    const newDraft = await prisma.post.create({
      data: {
        ...postData,
        userId: authUser.id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const childCreates = await buildChildRowUpdates(newDraft.id);
    await prisma.$transaction(childCreates as never[]);

    const [createdLinkedIn, createdX] = await Promise.all([
      prisma.linkedInPost.findUnique({ where: { postId: newDraft.id } }),
      prisma.xPost.findUnique({ where: { postId: newDraft.id } }),
    ]);

    return NextResponse.json(
      {
        id: newDraft.id,
        ...postData,
        linkedinPost: createdLinkedIn
          ? { id: createdLinkedIn.id, content: createdLinkedIn.content, status: createdLinkedIn.status, scheduledAt: createdLinkedIn.scheduledAt }
          : null,
        xPost: createdX
          ? { id: createdX.id, content: createdX.content, mode: createdX.mode, threadPosts: createdX.threadPosts, status: createdX.status, scheduledAt: createdX.scheduledAt }
          : null,
        createdAt: newDraft.createdAt,
        updatedAt: newDraft.updatedAt,
      },
      { status: 201 },
    );
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
