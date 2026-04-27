import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

const saveDraftSchema = z.object({
  id: z.string().optional(),
  clientDraftKey: z.string().min(1, "Client draft key is required"),
  post: generatedPostItemSchema,
  model: z.string().min(1, "Model is required"),
  updatedAt: z.string().datetime().optional(),
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

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, clientDraftKey, updatedAt, ...draftInput } = parsedBody.data;

    // 1. Try to find existing draft by ID or ClientDraftKey
    let existingDraft = null;

    if (id) {
      existingDraft = await prisma.post.findFirst({
        where: {
          id,
          userId: authUser.id,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });
    } else {
      existingDraft = await prisma.post.findFirst({
        where: {
          userId: authUser.id,
          clientDraftKey,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });
    }

    const draftData = buildDraftData(parsedBody.data);

    // 2. If draft exists, check for conflicts and update
    if (existingDraft) {
      if (updatedAt && existingDraft.updatedAt.toISOString() !== updatedAt) {
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

      const updatedDraft = await prisma.post.update({
        where: {
          id: existingDraft.id,
        },
        data: draftData,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(updatedDraft);
    }

    // 3. If no draft exists, create a new one
    const newDraft = await prisma.post.create({
      data: {
        ...draftData,
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

    return NextResponse.json(newDraft, { status: 201 });
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
