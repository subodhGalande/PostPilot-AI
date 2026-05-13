import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const draft = await prisma.post.findFirst({
    where: {
      id,
      userId: authUser.id,
    },
    include: {
      linkedinPost: true,
      xPost: true,
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  // Check if either child has DRAFT or SCHEDULED status
  const linkedInActive = draft.linkedinPost && 
    ["DRAFT", "SCHEDULED"].includes(draft.linkedinPost.status);
  const xActive = draft.xPost && 
    ["DRAFT", "SCHEDULED"].includes(draft.xPost.status);

  if (!linkedInActive && !xActive) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const reconstructed = {
    id: draft.id,
    title: draft.title,
    topic: draft.topic || "",
    baseIdea: draft.baseIdea || "",
    model: draft.model || "",
    clientDraftKey: draft.clientDraftKey,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    linkedin: draft.linkedinPost ? {
      content: draft.linkedinPost.content || "",
      status: draft.linkedinPost.status,
      scheduledAt: draft.linkedinPost.scheduledAt,
    } : null,
    x: draft.xPost ? {
      posts: draft.xPost.threadPosts || [],
      mode: draft.xPost.mode,
      status: draft.xPost.status,
      scheduledAt: draft.xPost.scheduledAt,
    } : null,
  };

  return NextResponse.json(reconstructed);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") as "linkedin" | "x" | null;

  // Find post and its child rows
  const post = await prisma.post.findFirst({
    where: {
      id,
      userId: authUser.id,
    },
    include: {
      linkedinPost: true,
      xPost: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  // If platform specified, delete specific child row
  if (platform) {
    const isLinkedIn = platform === "linkedin";
    const otherChild = isLinkedIn ? post.xPost : post.linkedinPost;
    const otherHasContent = otherChild?.content && otherChild.content.trim().length > 0;

    // Delete the target child row
    if (isLinkedIn) {
      if (post.linkedinPost) {
        await prisma.linkedInPost.delete({ where: { postId: id } });
      }
    } else {
      if (post.xPost) {
        await prisma.xPost.delete({ where: { postId: id } });
      }
    }

    // If other child has no content, cascade delete Post
    if (!otherHasContent) {
      await prisma.post.delete({ where: { id } });
      return NextResponse.json({ success: true, deletedEntirePost: true });
    }

    // Otherwise, Post is preserved
    return NextResponse.json({ success: true, deletedEntirePost: false });
  }

  // No platform - delete entire Post (cascade deletes both children)
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
