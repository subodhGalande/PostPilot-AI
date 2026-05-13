import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fetchType = searchParams.get("fetch") as string || "drafts";

  const isScheduled = fetchType === "scheduled";
  const targetStatus = isScheduled ? "SCHEDULED" : "DRAFT";

  const posts = await prisma.post.findMany({
    where: {
      userId: authUser.id,
      OR: [
        {
          linkedinPost: {
            status: targetStatus,
          },
        },
        {
          xPost: {
            status: targetStatus,
          },
        },
      ],
    },
    include: {
      linkedinPost: true,
      xPost: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        topic: post.topic || "",
        baseIdea: post.baseIdea || "",
        model: post.model || "",
        clientDraftKey: post.clientDraftKey,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        linkedinPost: post.linkedinPost
          ? {
              id: post.linkedinPost.id,
              content: post.linkedinPost.content,
              status: post.linkedinPost.status,
              scheduledAt: post.linkedinPost.scheduledAt,
            }
          : null,
        xPost: post.xPost
          ? {
              id: post.xPost.id,
              content: post.xPost.content,
              mode: post.xPost.mode,
              threadPosts: post.xPost.threadPosts,
              status: post.xPost.status,
              scheduledAt: post.xPost.scheduledAt,
            }
          : null,
      };
    }),
  );
}
