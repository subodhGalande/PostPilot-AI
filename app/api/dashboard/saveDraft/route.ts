import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

const saveDraftSchema = z.object({
  clientDraftKey: z.string().min(1, "Client draft key is required"),
  post: generatedPostItemSchema,
  model: z.string().min(1, "Model is required"),
});

const updateDraftSchema = saveDraftSchema.extend({
  draftId: z.string().min(1, "Draft id is required"),
  updatedAt: z.string().datetime("Updated at is required"),
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save draft";
}

function buildDraftData(input: z.infer<typeof saveDraftSchema>) {
  const title = input.post.baseIdea.trim();

  return {
    title,
    clientDraftKey: input.clientDraftKey,
    content: {
      ...input.post,
      model: input.model,
    },
    status: "DRAFT" as const,
  };
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsedBody = saveDraftSchema.safeParse(json);
    console.log(parsedBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existingDraft = await prisma.post.findFirst({
      where: {
        userId: authUser.id,
        clientDraftKey: parsedBody.data.clientDraftKey,
      } as never,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (existingDraft) {
      return NextResponse.json(existingDraft);
    }

    const draft = await prisma.post.create({
      data: {
        ...buildDraftData(parsedBody.data),
        userId: authUser.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("saveDraft POST route error", error);

    return NextResponse.json(
      {
        error: "Failed to save draft",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsedBody = updateDraftSchema.safeParse(json);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { draftId, updatedAt, ...draftInput } = parsedBody.data;

    const existingDraft = await prisma.post.findFirst({
      where: {
        id: draftId,
        userId: authUser.id,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (existingDraft.updatedAt.toISOString() !== updatedAt) {
      return NextResponse.json(
        {
          error: "Draft conflict",
          message:
            "This draft was updated in another tab. Refresh before saving again.",
          currentUpdatedAt: existingDraft.updatedAt.toISOString(),
        },
        { status: 409 },
      );
    }

    const draft = await prisma.post.update({
      where: {
        id: draftId,
      },
      data: buildDraftData(draftInput),
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error("saveDraft PATCH route error", error);

    return NextResponse.json(
      {
        error: "Failed to update draft",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
