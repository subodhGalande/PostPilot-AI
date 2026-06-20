"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Edit3, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { PostPreview } from "@/components/dashboard/post-preview";
import {
  saveDraft,
  parseStoredDraftContent,
  type SaveDraftResponse,
} from "@/lib/drafts";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/dashboard/confirmation-modal";

interface DraftEditorWorkspaceProps {
  initialDraftId: string;
  initialDraftUpdatedAt: string;
  initialCreatedAt: string;
  initialClientDraftKey: string;
  initialPostPack: GeneratedPostPack;
  initialStatus?: string;
  initialPlatform?: "linkedin" | "x";
  linkedinStatus?: string;
  xStatus?: string;
  postStyle?: string;
  targetAudience?: string;
  scheduledManagementPlatform?: "linkedin" | "x";
}

export function DraftEditorWorkspace({
  initialDraftId,
  initialDraftUpdatedAt,
  initialCreatedAt,
  initialClientDraftKey,
  initialPostPack,
  initialStatus,
  initialPlatform,
  linkedinStatus,
  xStatus,
  postStyle,
  targetAudience,
  scheduledManagementPlatform,
}: DraftEditorWorkspaceProps) {
  const router = useRouter();
  const isScheduledManagementView = Boolean(scheduledManagementPlatform);
  const [generatedPostPack, setGeneratedPostPack] =
    useState<GeneratedPostPack>(initialPostPack);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(initialDraftUpdatedAt);
  const [currentLinkedinStatus, setCurrentLinkedinStatus] =
    useState(linkedinStatus);
  const [currentXStatus, setCurrentXStatus] = useState(xStatus);
  const [clearedPlatforms, setClearedPlatforms] = useState<
    Set<"linkedin" | "x">
  >(() => {
    const initialCleared = new Set<"linkedin" | "x">();
    // Only hide other scheduled platforms if we're in the standard draft editor
    // If we're in the scheduled management view, we want to see the scheduled platform
    if (!isScheduledManagementView) {
      if (linkedinStatus && linkedinStatus !== "DRAFT")
        initialCleared.add("linkedin");
      if (xStatus && xStatus !== "DRAFT") initialCleared.add("x");
    }
    return initialCleared;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "SCHEDULED">(
    initialStatus as "DRAFT" | "SCHEDULED",
  );
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: "unschedule" | "delete" | null;
    platform?: "linkedin" | "x";
  }>({
    isOpen: false,
    type: null,
  });

  const handleOpenConfirmation = (
    type: "unschedule" | "delete",
    platform?: "linkedin" | "x",
  ) => {
    setConfirmationState({ isOpen: true, type, platform });
  };

  const handleCloseConfirmation = () => {
    setConfirmationState({ isOpen: false, type: null });
  };

  const handleUpdatePost = (
    updater: (currentPost: GeneratedPostItem) => GeneratedPostItem,
  ) => {
    setGeneratedPostPack((currentPack) => {
      if (!currentPack.post) {
        return currentPack;
      }

      return {
        ...currentPack,
        post: updater(currentPack.post),
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleLinkedInChange = (content: string) => {
    handleUpdatePost((currentPost) => ({
      ...currentPost,
      linkedin: {
        ...currentPost.linkedin,
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
    mutationFn: async (
      platform: "linkedin" | "x",
    ): Promise<SaveDraftResponse> => {
      if (!draftUpdatedAt) {
        throw new Error(
          "Missing draft version. Refresh the draft before saving again.",
        );
      }

      return saveDraft({
        id: initialDraftId,
        updatedAt: draftUpdatedAt,
        clientDraftKey: initialClientDraftKey,
        post: generatedPostPack.post,
        model: generatedPostPack.model,
        platform,
      });
    },
    onSuccess: (draft: SaveDraftResponse) => {
      setDraftUpdatedAt(draft.updatedAt);
      if (draft.status === "DRAFT" || draft.status === "SCHEDULED") {
        setStatus(draft.status);
      }
      setCurrentLinkedinStatus(
        draft.linkedinPost?.status ?? currentLinkedinStatus,
      );
      setCurrentXStatus(draft.xPost?.status ?? currentXStatus);

      if (draft.content) {
        const updatedContent = parseStoredDraftContent(draft.content);
        setGeneratedPostPack({
          post: updatedContent,
          model: updatedContent.model,
        });
      }

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

  const unscheduleMutation = useMutation({
    mutationFn: async (platform?: "linkedin" | "x") => {
      const response = await fetch("/api/dashboard/unschedulePost", {
        method: "POST",
        body: JSON.stringify({ id: initialDraftId, platform }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unschedule post");
      }
      return response.json();
    },
    onSuccess: (_data, platform) => {
      setStatus("DRAFT");
      toast.success("Post moved back to drafts.");

      if (platform) {
        router.replace(
          `/dashboard/drafts/${initialDraftId}?platform=${platform}`,
        );
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to unschedule",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (platform?: "linkedin" | "x") => {
      const url = platform
        ? `/api/dashboard/drafts/${initialDraftId}?platform=${platform}`
        : `/api/dashboard/drafts/${initialDraftId}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post deleted.");
      router.push(
        isScheduledManagementView ? "/dashboard/calendar" : "/dashboard/drafts",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post",
      );
    },
  });

  const handleConfirmAction = () => {
    const platform = confirmationState.platform ?? scheduledManagementPlatform;

    if (confirmationState.type === "unschedule") {
      unscheduleMutation.mutate(platform);
    } else if (confirmationState.type === "delete") {
      deleteMutation.mutate(platform);
    }
  };

  const saveStatusLabel = useMemo(() => {
    if (saveDraftMutation.isPending) return "Saving...";
    if (hasUnsavedChanges) return "Unsaved changes";

    const updatedAtDate = new Date(draftUpdatedAt);
    const diffMs = updatedAtDate.getTime() - Date.now();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);

    if (Math.abs(diffMins) < 60) {
      return `Saved ${new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      }).format(diffMins, "minute")}`;
    }

    if (Math.abs(diffHours) < 24) {
      return `Saved ${new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      }).format(diffHours, "hour")}`;
    }

    return `Saved on ${new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(updatedAtDate)}`;
  }, [saveDraftMutation.isPending, hasUnsavedChanges, draftUpdatedAt]);

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
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card/90 px-4 py-3 text-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-foreground">
          <div className="inline-flex items-center gap-2">
            <SaveStatusIcon
              className={`size-4 ${saveDraftMutation.isPending ? "animate-spin text-primary" : hasUnsavedChanges ? "text-amber-600" : "text-emerald-600"}`}
            />
            <span className="font-medium">{saveStatusLabel}</span>
          </div>
          <span className="rounded-full bg-muted/45 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Created {createdLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isScheduledManagementView ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  Post Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    handleOpenConfirmation(
                      "unschedule",
                      scheduledManagementPlatform,
                    )
                  }
                  disabled={unscheduleMutation.isPending}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Unschedule{" "}
                  {scheduledManagementPlatform === "linkedin"
                    ? "LinkedIn"
                    : "X"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : status === "SCHEDULED" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  Post Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleOpenConfirmation("unschedule")}
                  disabled={unscheduleMutation.isPending}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Move to Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
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
        id={initialDraftId}
        updatedAt={draftUpdatedAt}
        clientDraftKey={initialClientDraftKey}
        mode="draft"
        initialPlatform={initialPlatform}
        readOnly={isScheduledManagementView}
        onSaveDraft={() =>
          saveDraftMutation.mutate(initialPlatform || "linkedin")
        }
        onDeleteDraft={(platform) => handleOpenConfirmation("delete", platform)}
        clearedPlatforms={clearedPlatforms}
        onScheduleSuccess={(data) => {
          setDraftUpdatedAt(data.updatedAt);
          const nextLinkedinStatus =
            data.linkedinPost?.status ?? currentLinkedinStatus;
          const nextXStatus = data.xPost?.status ?? currentXStatus;

          if (data.status === "DRAFT" || data.status === "SCHEDULED") {
            setStatus(data.status);
          }
          setCurrentLinkedinStatus(nextLinkedinStatus);
          setCurrentXStatus(nextXStatus);

          // Track which platforms are scheduled so they can be hidden from the editor view
          const scheduledPlatform = data.platform;
          if (scheduledPlatform) {
            setClearedPlatforms((prev) => {
              const next = new Set(prev);
              next.add(scheduledPlatform);
              return next;
            });
          }

          if (nextLinkedinStatus !== "DRAFT" && nextXStatus !== "DRAFT") {
            setHasUnsavedChanges(false);
            router.push("/dashboard/calendar");
            return;
          }

          setGeneratedPostPack((currentPack) => {
            const currentPost = currentPack.post;
            if (!currentPost || !data.platform) return currentPack;

            const scheduledAt =
              data.platform === "linkedin"
                ? data.linkedinPost?.scheduledAt
                : data.xPost?.scheduledAt;

            const scheduledAtDate =
              scheduledAt instanceof Date
                ? scheduledAt.toISOString()
                : scheduledAt
                  ? new Date(scheduledAt as string).toISOString()
                  : null;

            const updatedPost =
              data.platform === "linkedin"
                ? {
                    ...currentPost,
                    linkedin: {
                      ...currentPost.linkedin,
                      status: "SCHEDULED" as const,
                      scheduledAt: scheduledAtDate,
                    },
                  }
                : {
                    ...currentPost,
                    x: {
                      ...currentPost.x,
                      status: "SCHEDULED" as const,
                      scheduledAt: scheduledAtDate,
                    },
                  };

            return {
              ...currentPack,
              post: updatedPost,
            };
          });

          setHasUnsavedChanges(false);
        }}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={
          confirmationState.type === "delete"
            ? `Delete ${confirmationState.platform ? (confirmationState.platform === "x" ? "X" : "LinkedIn") : "Post"}`
            : "Unschedule Post"
        }
        description={
          confirmationState.type === "delete"
            ? `Are you sure you want to delete this ${confirmationState.platform ? (confirmationState.platform === "x" ? "X" : "LinkedIn") : "post"}? This action cannot be undone.`
            : "Are you sure you want to move this post back to drafts? It will be unscheduled."
        }
        postTitle={generatedPostPack.post?.baseIdea}
        confirmText={
          confirmationState.type === "delete" ? "Delete" : "Unschedule"
        }
        variant={
          confirmationState.type === "delete" ? "destructive" : "default"
        }
      />
    </div>
  );
}
