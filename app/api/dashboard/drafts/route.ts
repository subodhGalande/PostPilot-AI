import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";
import {
  databaseConnectionErrorResponse,
  isDatabaseConnectionError,
} from "@/lib/server/database-errors";
import { draftStore } from "@/lib/server/draft-store";

export async function GET(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fetchType =
      (searchParams.get("fetch") as "drafts" | "scheduled") || "drafts";

    const posts = await draftStore.listDrafts(authUser.id, fetchType);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("drafts GET route error", error);

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    return NextResponse.json(
      {
        error: "Failed to fetch drafts",
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
