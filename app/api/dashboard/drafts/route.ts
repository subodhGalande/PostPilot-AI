import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { parseStoredDraftContent } from "@/lib/drafts";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") as any) || "DRAFT";

  const posts = await prisma.post.findMany({
    where: {
      userId: authUser.id,
      status: status,
    },
    select: {
      id: true,
      title: true,
      status: true,
      scheduledAt: true,
      createdAt: true,
      updatedAt: true,
      content: true,
      clientDraftKey: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    posts.map((post) => {
      const parsedContent = parseStoredDraftContent(post.content);

      return {
        id: post.id,
        title: post.title,
        status: post.status,
        scheduledAt: post.scheduledAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        clientDraftKey: post.clientDraftKey,
        content: parsedContent,
        baseIdea: parsedContent.baseIdea,
        topic: parsedContent.topic,
      };
    }),
  );
}
