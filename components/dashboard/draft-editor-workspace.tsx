"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Edit3, Loader2 } from "lucide-react";

import { PostPreview } from "@/components/dashboard/post-preview";
import { saveDraft, type SaveDraftResponse } from "@/lib/drafts";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";

interface DraftEditorWorkspaceProps {
  initialDraftId: string;
  initialDraftUpdatedAt: string;
  initialCreatedAt: string;
  initialClientDraftKey: string;
  initialPostPack: GeneratedPostPack;
  postStyle?: string;
  targetAudience?: string;
}

export function DraftEditorWorkspace({
  initialDraftId,
  initialDraftUpdatedAt,
  initialCreatedAt,
  initialClientDraftKey,
  initialPostPack,
  postStyle,
  targetAudience,
}: DraftEditorWorkspaceProps) {
  const [generatedPostPack, setGeneratedPostPack] =
    useState<GeneratedPostPack>(initialPostPack);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(initialDraftUpdatedAt);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleUpdatePost = (
    updater: (currentPost: GeneratedPostItem) => GeneratedPostItem,
  ) => {
    setGeneratedPostPack((currentPack) => {
      if (currentPack.posts.length === 0) {
        return currentPack;
      }

      return {
        ...currentPack,
        posts: [updater(currentPack.posts[0]), ...currentPack.posts.slice(1)],
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleLinkedInChange = (content: string) => {
    handleUpdatePost((currentPost) => ({
      ...currentPost,
      linkedin: {
        content,
      },
    }));
  };

  const handleXPostChange = (postId: string, content: string) => {
    handleUpdatePost((currentPost) => ({
      ...currentPost,
      x: {
        ...currentPost.x,
        posts: currentPost.x.posts.map((threadPost) =>
          threadPost.id === postId ? { ...threadPost, content } : threadPost,
        ),
      },
    }));
  };

  const saveDraftMutation = useMutation({
    mutationKey: ["draftDetailSave", initialDraftId],
    mutationFn: async (): Promise<SaveDraftResponse> => {
      if (!draftUpdatedAt) {
        throw new Error(
          "Missing draft version. Refresh the draft before saving again.",
        );
      }

      return saveDraft({
        id: initialDraftId,
        updatedAt: draftUpdatedAt,
        clientDraftKey: initialClientDraftKey,
        post: generatedPostPack.posts[0],
        model: generatedPostPack.model,
      });
    },
    onSuccess: (draft) => {
      setDraftUpdatedAt(draft.updatedAt);
      setHasUnsavedChanges(false);
      toast.success("Draft updated.");
    },
    onError: (error) => {
      console.error("Failed to update draft:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update draft.",
      );
    },
  });

  const saveStatusLabel = saveDraftMutation.isPending
    ? "Saving..."
    : hasUnsavedChanges
      ? "Unsaved changes"
      : `Saved ${new Intl.RelativeTimeFormat("en", {
          numeric: "auto",
        }).format(
          Math.round((new Date(draftUpdatedAt).getTime() - Date.now()) / 60000),
          "minute",
        )}`;

  const createdLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(initialCreatedAt));

  const SaveStatusIcon = saveDraftMutation.isPending
    ? Loader2
    : hasUnsavedChanges
      ? Edit3
      : CheckCircle2;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card/90 px-4 py-3 text-sm shadow-sm">
        <div className="inline-flex items-center gap-2 text-foreground">
          <SaveStatusIcon
            className={`size-4 ${saveDraftMutation.isPending ? "animate-spin text-primary" : hasUnsavedChanges ? "text-amber-600" : "text-emerald-600"}`}
          />
          <span className="font-medium">{saveStatusLabel}</span>
        </div>
        <span className="rounded-full bg-muted/45 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Created {createdLabel}
        </span>
      </div>

      <PostPreview
        className="h-full w-full"
        postStyle={postStyle}
        targetAudience={targetAudience}
        generatedPostPack={generatedPostPack}
        onLinkedInChange={handleLinkedInChange}
        onXPostChange={handleXPostChange}
        isGenerated
        isSavingDraft={saveDraftMutation.isPending}
        mode="draft"
        onSaveDraft={() => saveDraftMutation.mutate()}
      />
    </div>
  );
}
