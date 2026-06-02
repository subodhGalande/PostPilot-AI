import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";

import {
  databaseConnectionErrorResponse,
  isDatabaseConnectionError,
} from "@/lib/server/database-errors";
import { draftStore, NotFoundError } from "@/lib/server/draft-store";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, platform } = await req.json();
    const result = await draftStore.unscheduleDraft(authUser.id, id, platform);

    return NextResponse.json(result);
  } catch (error) {
    console.error("unschedulePost POST route error", error);

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to unschedule post",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
