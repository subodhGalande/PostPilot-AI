import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DraftEditorWorkspace } from "@/components/dashboard/draft-editor-workspace";
import { requireAuthJose } from "@/lib/auth/auth";
import {
  createClientDraftKey,
  mapStoredDraftToGeneratedPostPack,
  reconstructPostContent,
} from "@/lib/drafts";
import { draftStore } from "@/lib/server/draft-store";

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

  const draft = await draftStore.getDraft(authUser.id, id);

  if (!draft) {
    notFound();
  }

  const parsedContent = reconstructPostContent({
    topic: draft.topic,
    baseIdea: draft.baseIdea,
    model: draft.model,
    linkedinPost: draft.linkedinPost,
    xPost: draft.xPost,
  });

  // Determine initial platform based on draft status
  const linkedinIsDraft = draft.linkedinPost?.status === "DRAFT";
  const xIsDraft = draft.xPost?.status === "DRAFT";

  let initialPlatform: "linkedin" | "x" | undefined;
  if (platform === "linkedin" || platform === "x") {
    initialPlatform = platform as "linkedin" | "x";
  } else if (linkedinIsDraft) {
    initialPlatform = "linkedin";
  } else if (xIsDraft) {
    initialPlatform = "x";
  }

  const scheduledManagementPlatform =
    from === "calendar" &&
    ((platform === "linkedin" && draft.linkedinPost?.status === "SCHEDULED") ||
      (platform === "x" && draft.xPost?.status === "SCHEDULED"))
      ? (platform as "linkedin" | "x")
      : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 bg-slate-50/50 px-2 py-4 dark:bg-transparent md:p-6">
      <DraftEditorWorkspace
        initialDraftId={draft.id}
        initialDraftUpdatedAt={draft.updatedAt}
        initialCreatedAt={draft.createdAt.toISOString()}
        initialClientDraftKey={draft.clientDraftKey ?? createClientDraftKey()}
        initialPostPack={mapStoredDraftToGeneratedPostPack(parsedContent)}
        initialPlatform={initialPlatform}
        initialStatus={scheduledManagementPlatform ? "SCHEDULED" : "DRAFT"}
        linkedinStatus={draft.linkedinPost?.status ?? undefined}
        xStatus={draft.xPost?.status ?? undefined}
        scheduledManagementPlatform={scheduledManagementPlatform}
      />
    </div>
  );
}
