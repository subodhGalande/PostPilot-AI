import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DraftEditorWorkspace } from "@/components/dashboard/draft-editor-workspace";
import { Button } from "@/components/ui/button";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import {
  createClientDraftKey,
  mapStoredDraftToGeneratedPostPack,
  reconstructPostContent,
} from "@/lib/drafts";
import prisma from "@/lib/prisma";

export default async function DraftDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ platform?: string; from?: string }>;
}) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { platform, from } = await searchParams;

  const draft = await prisma.post.findFirst({
    where: {
      id,
      userId: authUser.id,
      OR: [
        { linkedinStatus: { in: ["DRAFT", "SCHEDULED"] } },
        { xStatus: { in: ["DRAFT", "SCHEDULED"] } },
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
  });

  if (!draft) {
    notFound();
  }

  const parsedContent = reconstructPostContent(draft);

  const breadcrumbHref = from === "calendar" ? "/dashboard/calendar" : "/dashboard/drafts";
  const breadcrumbLabel = from === "calendar" ? "Calendar" : "Drafts";

  // Determine initial platform based on draft status
  // If URL has platform param, use it; otherwise auto-select draft platform
  const linkedinIsDraft = draft.linkedinStatus === "DRAFT";
  const xIsDraft = draft.xStatus === "DRAFT";
  
  let initialPlatform: "linkedin" | "x" | undefined;
  if (platform === "linkedin" || platform === "x") {
    initialPlatform = platform as "linkedin" | "x";
  } else if (linkedinIsDraft) {
    initialPlatform = "linkedin";
  } else if (xIsDraft) {
    initialPlatform = "x";
  }

  return (
    <div className="flex flex-1 flex-col gap-4 bg-slate-50/50 p-4 dark:bg-transparent md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={breadcrumbHref}
          className="font-medium transition-colors hover:text-foreground"
        >
          {breadcrumbLabel}
        </Link>
        <ChevronRight className="size-4" />
        <span className="max-w-[24rem] truncate text-foreground">
          {draft.title}
        </span>
      </div>

      <DraftEditorWorkspace
        initialDraftId={draft.id}
        initialDraftUpdatedAt={draft.updatedAt.toISOString()}
        initialCreatedAt={draft.createdAt.toISOString()}
        initialClientDraftKey={draft.clientDraftKey ?? createClientDraftKey()}
        initialPostPack={mapStoredDraftToGeneratedPostPack(parsedContent)}
        initialPlatform={initialPlatform}
        linkedinStatus={draft.linkedinStatus}
        xStatus={draft.xStatus}
      />
    </div>
  );
}
