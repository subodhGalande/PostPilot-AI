import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { DraftsGrid } from "@/components/dashboard/drafts-grid";
import { Button } from "@/components/ui/button";
import { requireAuthJose } from "@/lib/auth/auth";
import { draftStore } from "@/lib/server/draft-store";

export default async function DraftsPage() {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  const drafts = await draftStore.listDrafts(authUser.id, "drafts");

  return (
    <div className="flex flex-1 flex-col gap-6 bg-slate-50/50 p-4 dark:bg-transparent md:p-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Draft Library
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Saved drafts, ready to refine
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Open any saved draft and continue editing it in the same LinkedIn
            and X workspace you already use on the dashboard.
          </p>
        </div>
        <Button asChild className="rounded-xl font-semibold shadow-md">
          <Link href="/dashboard">
            <Plus className="mr-2 size-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/80 p-10 text-center shadow-sm">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-foreground">
            No saved drafts yet
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Generate a post on the dashboard, make your edits, and save it as a
            draft to build up your reusable content library here.
          </p>
          <Button asChild className="mt-5 rounded-xl font-semibold">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <DraftsGrid
          initialDrafts={drafts.map((draft) => ({
            id: draft.id,
            title: draft.title,
            topic: draft.topic,
            createdAt: draft.createdAt.toISOString(),
            updatedAt: draft.updatedAt,
            linkedinPost: draft.linkedinPost as any,
            xPost: draft.xPost as any,
          }))}
        />
      )}
    </div>
  );
}
