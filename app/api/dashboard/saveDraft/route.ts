import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import prisma from "@/lib/prisma";
import { generatedPostItemSchema } from "@/lib/social-posts";

import { saveDraftSchema } from "@/lib/schemas/post.schema";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save draft";
}

function buildDraftData(input: z.infer<typeof saveDraftSchema>) {
  const title = input.post.baseIdea.trim();
  
  // Defensive: ensure platform status always exists
  const linkedinData = input.post.linkedin || {};
  const xData = input.post.x || {};
  
  console.log("buildDraftData - linkedin:", JSON.stringify(linkedinData, null, 2));
  console.log("buildDraftData - x:", JSON.stringify(xData, null, 2));

  return {
    title,
    clientDraftKey: input.clientDraftKey,
    content: {
      ...input.post,
      model: input.model,
      linkedin: {
        ...linkedinData,
        status: linkedinData.status || "DRAFT",
        scheduledAt: linkedinData.scheduledAt || null,
      },
      x: {
        ...xData,
        status: xData.status || "DRAFT",
        scheduledAt: xData.scheduledAt || null,
      },
    },
    // Platform-specific statuses only
    linkedinStatus: (linkedinData.status || "DRAFT") as any,
    linkedinScheduledAt: linkedinData.scheduledAt 
      ? new Date(linkedinData.scheduledAt) 
      : null,
    xStatus: (xData.status || "DRAFT") as any,
    xScheduledAt: xData.scheduledAt 
      ? new Date(xData.scheduledAt) 
      : null,
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

    console.log("Save draft payload:", JSON.stringify(parsedBody.data, null, 2));

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
          content: true,
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
        content: true,
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
