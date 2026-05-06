import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { reconstructPostContent } from "@/lib/drafts";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fetchType = searchParams.get("fetch") as string || "drafts";

  // For drafts: show posts where at least one platform is DRAFT
  // For calendar: show posts where at least one platform is SCHEDULED
  const isScheduled = fetchType === "scheduled";
  
  const posts = await prisma.post.findMany({
    where: {
      userId: authUser.id,
      OR: isScheduled 
        ? [
            { linkedinStatus: "SCHEDULED" },
            { xStatus: "SCHEDULED" },
          ]
        : [
            { linkedinStatus: "DRAFT" },
            { xStatus: "DRAFT" },
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
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    posts.map((post) => {
      const parsedContent = reconstructPostContent(post);

      return {
        id: post.id,
        title: post.title,
        linkedinStatus: post.linkedinStatus,
        linkedinScheduledAt: post.linkedinScheduledAt,
        xStatus: post.xStatus,
        xScheduledAt: post.xScheduledAt,
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
