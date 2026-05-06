import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { reconstructPostContent } from "@/lib/drafts";
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
      OR: [
        { linkedinStatus: { in: ["DRAFT", "SCHEDULED"] } },
        { xStatus: { in: ["DRAFT", "SCHEDULED"] } },
      ],
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
      clientDraftKey: true,
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...draft,
    content: reconstructPostContent(draft),
  });
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

  const post = await prisma.post.findFirst({
    where: {
      id,
      userId: authUser.id,
    },
    select: {
      id: true,
      linkedinContent: true,
      linkedinStatus: true,
      xContent: true,
      xStatus: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (platform) {
    const isLinkedIn = platform === "linkedin";
    const otherPlatformContent = isLinkedIn
      ? post.xContent
      : post.linkedinContent;
    const otherPlatformStatus = isLinkedIn ? post.xStatus : post.linkedinStatus;

    const hasOtherPlatformContent = otherPlatformContent !== null;
    const isOtherPlatformActive =
      otherPlatformStatus &&
      ["DRAFT", "SCHEDULED", "PUBLISHED"].includes(otherPlatformStatus);
    const isOtherPlatformDeleted =
      otherPlatformStatus === "DELETED" && otherPlatformContent === null;

    const updateData: Record<string, unknown> = {};

    if (isLinkedIn) {
      updateData.linkedinContent = null;
      updateData.linkedinStatus = "DELETED";
    } else {
      updateData.xContent = null;
      updateData.xStatus = "DELETED";
    }

    if (hasOtherPlatformContent || isOtherPlatformActive) {
      await prisma.post.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, deletedEntirePost: false });
    } else if (isOtherPlatformDeleted) {
      await prisma.post.delete({ where: { id } });
      return NextResponse.json({ success: true, deletedEntirePost: true });
    } else {
      await prisma.post.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, deletedEntirePost: false });
    }
  } else {
    await prisma.post.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  }
}
