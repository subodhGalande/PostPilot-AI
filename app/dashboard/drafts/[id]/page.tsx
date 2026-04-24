import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DraftEditorWorkspace } from "@/components/dashboard/draft-editor-workspace";
import { Button } from "@/components/ui/button";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import {
  createClientDraftKey,
  mapStoredDraftToGeneratedPostPack,
  parseStoredDraftContent,
} from "@/lib/drafts";
import prisma from "@/lib/prisma";

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  const { id } = await params;

  const draft = await prisma.post.findFirst({
    where: {
      id,
      userId: authUser.id,
      status: "DRAFT",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      clientDraftKey: true,
      content: true,
    },
  });

  if (!draft) {
    notFound();
  }

  const parsedContent = parseStoredDraftContent(draft.content);

  return (
    <div className="flex flex-1 flex-col gap-4 bg-slate-50/50 p-4 dark:bg-transparent md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/drafts"
          className="font-medium transition-colors hover:text-foreground"
        >
          Drafts
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
      />
    </div>
  );
}
