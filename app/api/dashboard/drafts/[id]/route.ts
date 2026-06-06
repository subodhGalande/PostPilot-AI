import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";
import {
  databaseConnectionErrorResponse,
  isDatabaseConnectionError,
} from "@/lib/server/database-errors";
import { draftStore, NotFoundError } from "@/lib/server/draft-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const draft = await draftStore.getDraft(authUser.id, id);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      topic: draft.topic,
      baseIdea: draft.baseIdea,
      model: draft.model,
      clientDraftKey: draft.clientDraftKey,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      linkedin: draft.linkedinPost
        ? {
            content: draft.linkedinPost.content || "",
            status: draft.linkedinPost.status,
            scheduledAt: draft.linkedinPost.scheduledAt,
          }
        : null,
      x: draft.xPost
        ? {
            posts: (draft.xPost.threadPosts as unknown[]) || [],
            mode: draft.xPost.mode,
            status: draft.xPost.status,
            scheduledAt: draft.xPost.scheduledAt,
          }
        : null,
    });
  } catch (error) {
    console.error("draft GET route error", error);

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    return NextResponse.json(
      {
        error: "Failed to fetch draft",
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
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

  try {
    const result = await draftStore.deleteDraft(
      authUser.id,
      id,
      platform ?? undefined,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    throw error;
  }
}
