import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { parseStoredDraftContent } from "@/lib/drafts";
import prisma from "@/lib/prisma";

export async function GET() {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drafts = await prisma.post.findMany({
    where: {
      userId: authUser.id,
      status: "DRAFT",
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      content: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    drafts.map((draft) => {
      const parsedContent = parseStoredDraftContent(draft.content);

      return {
        id: draft.id,
        title: draft.title,
        status: draft.status,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        baseIdea: parsedContent.baseIdea,
        topic: parsedContent.topic,
      };
    }),
  );
}
