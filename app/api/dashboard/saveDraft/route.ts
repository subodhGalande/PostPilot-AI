import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireAuthJose } from "@/lib/auth/auth";
import {
  databaseConnectionErrorResponse,
  isDatabaseConnectionError,
} from "@/lib/server/database-errors";

import {
  draftStore,
  DraftStoreError,
  ConflictError,
  ValidationError,
} from "@/lib/server/draft-store";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = await draftStore.saveDraft(authUser.id, json);

    return NextResponse.json(result);
  } catch (error) {
    console.error("saveDraft POST route error", error);

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    if (error instanceof ValidationError || error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details:
            error instanceof ValidationError
              ? error.details
              : (error as ZodError).flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof ConflictError) {
      return NextResponse.json(
        {
          error: "Draft conflict",
          message: error.message,
          currentUpdatedAt: error.currentUpdatedAt,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to save draft",
        message:
          error instanceof DraftStoreError
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
