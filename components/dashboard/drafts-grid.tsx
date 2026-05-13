"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock3,
  FileText,
  History,
  Loader2,
  Trash2,
  Linkedin,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LinkedInPostData = {
  id: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
} | null;

type XPostData = {
  id: string;
  content: string | null;
  mode: string | null;
  threadPosts: unknown;
  status: string;
  scheduledAt: Date | null;
} | null;

type DraftListItem = {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  linkedinPost?: LinkedInPostData;
  xPost?: XPostData;
};

interface DraftsGridProps {
  initialDrafts: DraftListItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function DraftsGrid({ initialDrafts }: DraftsGridProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [pendingDeleteDraft, setPendingDeleteDraft] =
    useState<DraftListItem | null>(null);

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const response = await fetch(`/api/dashboard/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;

        throw new Error(
          errorBody?.message ?? errorBody?.error ?? "Failed to delete draft.",
        );
      }
    },
    onMutate: async (draftId) => {
      const previousDrafts = drafts;
      setDrafts((currentDrafts) =>
        currentDrafts.filter((draft) => draft.id !== draftId),
      );
      setPendingDeleteDraft(null);

      return { previousDrafts };
    },
    onSuccess: () => {
      toast.success("Draft deleted.");
    },
    onError: (error, _draftId, context) => {
      if (context?.previousDrafts) {
        setDrafts(context.previousDrafts);
      }

      console.error("Failed to delete draft:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete draft.",
      );
    },
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {drafts.map((draft) => (
          <article
            key={draft.id}
            className="group flex h-full cursor-pointer flex-col rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card dark:border-transparent dark:bg-card/80 dark:hover:bg-card"
            onClick={() => router.push(`/dashboard/drafts/${draft.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="flex items-center gap-2">
                {(draft.linkedinPost?.status === "DRAFT" || draft.xPost?.status === "DRAFT") && (
                  <div className="flex gap-1">
                    {draft.linkedinPost?.status === "DRAFT" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600 border border-blue-200">
                        LinkedIn
                      </span>
                    )}
                    {draft.xPost?.status === "DRAFT" && (
                      <span className="rounded-full bg-slate-900/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        X
                      </span>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs font-medium text-muted-foreground shadow-none hover:border-destructive/25 hover:bg-destructive/8 hover:text-destructive dark:bg-input/20 dark:hover:bg-destructive/15"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDeleteDraft(draft);
                  }}
                  aria-label={`Delete ${draft.title}`}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-1 flex-col">
              <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-foreground transition-colors group-hover:text-primary">
                {draft.title}
              </h3>

              <div className="mt-5 flex flex-wrap gap-2 pt-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/45 px-3 py-1.5 text-xs font-medium text-foreground">
                  <Clock3 className="size-3.5 text-muted-foreground" />
                  <span>Edited {formatDate(draft.updatedAt)}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <History className="size-3.5" />
                  <span>Created {formatDate(draft.createdAt)}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={pendingDeleteDraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteDraft(null);
          }
        }}
      >
        <DialogContent className="rounded-2xl p-0 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-4 border-b px-6 py-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-left">Delete draft?</DialogTitle>
                <DialogDescription className="mt-2 text-left leading-6">
                  This will permanently remove the selected draft from your
                  workspace.
                </DialogDescription>
                {pendingDeleteDraft ? (
                  <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm font-medium text-foreground">
                    {pendingDeleteDraft.title}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="px-6 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteDraft(null)}
              disabled={deleteDraftMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (pendingDeleteDraft) {
                  deleteDraftMutation.mutate(pendingDeleteDraft.id);
                }
              }}
              disabled={deleteDraftMutation.isPending}
            >
              {deleteDraftMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              {deleteDraftMutation.isPending ? "Deleting..." : "Delete draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
