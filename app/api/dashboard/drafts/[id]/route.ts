import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { parseStoredDraftContent } from "@/lib/drafts";
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
      status: { in: ["DRAFT", "SCHEDULED"] },
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      clientDraftKey: true,
      content: true,
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...draft,
    content: parseStoredDraftContent(draft.content),
  });
}

export async function DELETE(
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
      status: { in: ["DRAFT", "SCHEDULED"] },
    },
    select: {
      id: true,
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  await prisma.post.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ success: true });
}
