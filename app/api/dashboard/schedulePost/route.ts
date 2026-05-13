import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

import { schedulePostSchema } from "@/lib/schemas/post.schema";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to schedule post";
}

function buildPostData(input: z.infer<typeof schedulePostSchema>) {
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

    const { id, clientDraftKey, updatedAt, post, platform, scheduledAt } = parsedBody.data;
    const scheduledDate = new Date(scheduledAt);

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
          createdAt: true,
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
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    const postData = buildPostData(parsedBody.data);

    // 2. If post exists, check for conflicts and update child row
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

      // Update post metadata and target child row in transaction
      if (platform === "linkedin" && post.linkedin?.content?.trim()) {
        await prisma.$transaction([
          prisma.post.update({
            where: { id: existingPost.id },
            data: postData,
          }),
          prisma.linkedInPost.upsert({
            where: { postId: existingPost.id },
            update: {
              content: post.linkedin.content,
              status: "SCHEDULED",
              scheduledAt: scheduledDate,
            },
            create: {
              content: post.linkedin.content,
              status: "SCHEDULED",
              scheduledAt: scheduledDate,
              postId: existingPost.id,
            },
          }),
        ]);

        const [updatedPost, updatedLinkedIn] = await Promise.all([
          prisma.post.findUnique({ where: { id: existingPost.id } }),
          prisma.linkedInPost.findUnique({ where: { postId: existingPost.id } }),
        ]);

        return NextResponse.json({
          ...updatedPost,
          linkedinPost: updatedLinkedIn ? {
            id: updatedLinkedIn.id,
            content: updatedLinkedIn.content,
            status: updatedLinkedIn.status,
            scheduledAt: updatedLinkedIn.scheduledAt,
          } : null,
          xPost: null,
        });
      }

      if (platform === "x" && post.x?.posts?.length > 0) {
        const firstPost = post.x.posts[0];
        if (firstPost?.content?.trim()) {
          await prisma.$transaction([
            prisma.post.update({
              where: { id: existingPost.id },
              data: postData,
            }),
            prisma.xPost.upsert({
              where: { postId: existingPost.id },
              update: {
                content: firstPost.content,
                mode: post.x.mode || "single",
                threadPosts: post.x.posts,
                status: "SCHEDULED",
                scheduledAt: scheduledDate,
              },
              create: {
                content: firstPost.content,
                mode: post.x.mode || "single",
                threadPosts: post.x.posts,
                status: "SCHEDULED",
                scheduledAt: scheduledDate,
                postId: existingPost.id,
              },
            }),
          ]);

          const [updatedPost, updatedX] = await Promise.all([
            prisma.post.findUnique({ where: { id: existingPost.id } }),
            prisma.xPost.findUnique({ where: { postId: existingPost.id } }),
          ]);

          return NextResponse.json({
            ...updatedPost,
            linkedinPost: null,
            xPost: updatedX ? {
              id: updatedX.id,
              content: updatedX.content,
              mode: updatedX.mode,
              threadPosts: updatedX.threadPosts,
              status: updatedX.status,
              scheduledAt: updatedX.scheduledAt,
            } : null,
          });
        }
      }
    }

    // 3. If no post exists, create new post with scheduled child rows
    const newPost = await prisma.post.create({
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

    const childCreates: unknown[] = [];

    if (platform === "linkedin" && post.linkedin?.content?.trim()) {
      childCreates.push(
        prisma.linkedInPost.create({
          data: {
            content: post.linkedin.content,
            status: "SCHEDULED",
            scheduledAt: scheduledDate,
            postId: newPost.id,
          },
        }),
      );
    }

    if (platform === "x" && post.x?.posts?.length > 0) {
      const firstPost = post.x.posts[0];
      if (firstPost?.content?.trim()) {
        childCreates.push(
          prisma.xPost.create({
            data: {
              content: firstPost.content,
              mode: post.x.mode || "single",
              threadPosts: post.x.posts,
              status: "SCHEDULED",
              scheduledAt: scheduledDate,
              postId: newPost.id,
            },
          }),
        );
      }
    }

    await prisma.$transaction(childCreates as never[]);

    const [createdLinkedIn, createdX] = await Promise.all([
      prisma.linkedInPost.findUnique({ where: { postId: newPost.id } }),
      prisma.xPost.findUnique({ where: { postId: newPost.id } }),
    ]);

    return NextResponse.json(
      {
        ...postData,
        id: newPost.id,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt,
        linkedinPost: createdLinkedIn ? {
          id: createdLinkedIn.id,
          content: createdLinkedIn.content,
          status: createdLinkedIn.status,
          scheduledAt: createdLinkedIn.scheduledAt,
        } : null,
        xPost: createdX ? {
          id: createdX.id,
          content: createdX.content,
          mode: createdX.mode,
          threadPosts: createdX.threadPosts,
          status: createdX.status,
          scheduledAt: createdX.scheduledAt,
        } : null,
      },
      { status: 201 },
    );
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
