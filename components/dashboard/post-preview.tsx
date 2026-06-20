"use client";

import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { LinkedInPostPreview } from "@/components/dashboard/linkedin-post-preview";
import { XPostPreview } from "@/components/dashboard/x-post-preview";
import { SchedulePostModal } from "@/components/dashboard/schedule-post-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SaveDraftResponse } from "@/lib/drafts";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { cn } from "@/lib/utils";

type Platform = "linkedin" | "x";
type PlatformTab = "linkedin" | "x";
type PostPreviewMode = "generated" | "draft";

interface PostPreviewProps {
  className?: string;
  postStyle?: string;
  targetAudience?: string;
  generatedPostPack: GeneratedPostPack | null;
  onLinkedInChange: (content: string) => void;
  onXPostChange: (postId: string, content: string) => void;
  isGenerated?: boolean;
  isGenerating?: boolean;
  isSavingDraft?: boolean;
  mode?: PostPreviewMode;
  id?: string;
  updatedAt?: string;
  clientDraftKey?: string;
  initialPlatform?: PlatformTab;
  saveDraftLabel?: string;
  onSaveDraft?: (platform: Platform) => void;
  onDeleteDraft?: (platform: Platform) => void;
  onScheduleSuccess?: (data: SaveDraftResponse) => void;
  onReset?: () => void;
  hideStatusBadge?: boolean;
  readOnly?: boolean;
  clearedPlatforms?: Set<Platform>;
}

export function PostPreview({
  className,
  postStyle,
  targetAudience,
  generatedPostPack,
  onLinkedInChange,
  onXPostChange,
  isGenerated = true,
  isGenerating = false,
  isSavingDraft = false,
  mode = "generated",
  id,
  updatedAt,
  clientDraftKey,
  initialPlatform = "linkedin",
  saveDraftLabel,
  onSaveDraft,
  onDeleteDraft,
  onScheduleSuccess,
  onReset,
  hideStatusBadge = false,
  readOnly = false,
  clearedPlatforms = new Set(),
}: PostPreviewProps) {
  const [activePlatform, setActivePlatform] =
    useState<PlatformTab>(initialPlatform);
  const isDebouncingRef = useRef(false);

  useEffect(() => {
    if (initialPlatform) {
      setActivePlatform(initialPlatform);
    }
  }, [initialPlatform]);

  const handleSaveDraft = useCallback(
    (platform: Platform) => {
      if (isDebouncingRef.current || isSavingDraft || isGenerating) return;
      isDebouncingRef.current = true;
      onSaveDraft?.(platform);
      setTimeout(() => {
        isDebouncingRef.current = false;
      }, 500);
    },
    [isSavingDraft, isGenerating, onSaveDraft],
  );

  const activePost: GeneratedPostItem | null = generatedPostPack?.post ?? null;

  const availablePlatforms = useMemo(() => {
    if (!activePost) return [];
    return (["linkedin", "x"] as const).filter((p) => {
      const isValidStatus = ["DRAFT", "SCHEDULED"].includes(
        activePost[p].status,
      );
      const isNotCleared = !clearedPlatforms.has(p);

      return isValidStatus && isNotCleared;
    });
  }, [activePost, clearedPlatforms]);

  // Ensure activePlatform is always one of the available platforms
  useEffect(() => {
    if (
      availablePlatforms.length > 0 &&
      !availablePlatforms.includes(activePlatform)
    ) {
      setActivePlatform(availablePlatforms[0]);
    }
  }, [availablePlatforms, activePlatform]);

  // A post is considered "thinking" only if we are generating AND have no content at all yet
  const isThinking =
    isGenerating &&
    (!activePost ||
      (!activePost.linkedin.content && !activePost.x.posts.length));

  const title = mode === "draft" ? "Editor" : "Generated Preview";
  const description = mode === "draft" ? "" : "Edit for LinkedIn or X";
  const activePlatformLabel = activePlatform === "linkedin" ? "LinkedIn" : "X";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b p-4 md:p-6">
        {isGenerated ? (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0 lg:hidden"
            onClick={onReset}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <h3 className="text-lg font-bold">{title}</h3>
          {!hideStatusBadge && activePost && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wider font-medium",
                activePost[activePlatform].status === "SCHEDULED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
              )}
            >
              {activePost[activePlatform].status === "SCHEDULED" ? (
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {activePlatform === "linkedin"
                    ? "LinkedIn Scheduled"
                    : "X Scheduled"}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {activePlatform === "linkedin" ? "LinkedIn Draft" : "X Draft"}
                </span>
              )}
            </Badge>
          )}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground pr-2">{description}</p>
        ) : null}
        {activePost && availablePlatforms.length > 1 && (
          <Tabs
            value={activePlatform}
            onValueChange={(value) => setActivePlatform(value as PlatformTab)}
            className="hidden md:flex"
          >
            <TabsList className="bg-muted/80 border">
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="x">X</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!isGenerated && !isGenerating ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
            <FileText className="size-10 text-primary" />
          </div>
          <h4 className="mb-2 text-xl font-bold">Ready to Write</h4>
          <p className="max-w-sm text-sm text-muted-foreground">
            Fill out the configuration on the left and hit generate to create
            your first draft.
          </p>
        </div>
      ) : null}

      {isThinking ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-6 fade-in">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Thinking...
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Analyzing your request and preparing the post structure...
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-12 w-full" />
            <div className="mt-6 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="mt-6 h-24 w-full" />
            <Skeleton className="mt-3 h-24 w-full" />
          </div>
        </div>
      ) : null}

      {isGenerated && !isThinking && activePost && generatedPostPack ? (
        <>
          {availablePlatforms.length > 1 && (
            <div className="border-b px-4 py-3 md:hidden">
              <Tabs
                value={activePlatform}
                onValueChange={(value) =>
                  setActivePlatform(value as PlatformTab)
                }
              >
                <TabsList className="w-full bg-muted/80 border">
                  <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                  <TabsTrigger value="x">X</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {activePlatform === "linkedin" ? (
            <LinkedInPostPreview
              postStyle={postStyle}
              targetAudience={targetAudience}
              post={activePost}
              onChange={onLinkedInChange}
              readOnly={readOnly}
            />
          ) : (
            <XPostPreview
              postStyle={postStyle}
              targetAudience={targetAudience}
              post={activePost}
              onPostChange={onXPostChange}
              readOnly={readOnly}
            />
          )}

          <div className="border-t px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              {activePost[activePlatform].status === "DRAFT" && (
                <SchedulePostModal
                  post={activePost}
                  model={generatedPostPack.model}
                  clientDraftKey={clientDraftKey || ""}
                  id={id}
                  updatedAt={updatedAt}
                  platform={activePlatform}
                  onSuccess={onScheduleSuccess}
                >
                  <Button
                    className="w-full flex-1 rounded-xl font-semibold shadow-md transition-all"
                    disabled={isGenerating}
                  >
                    <Calendar className="mr-2 size-4" />
                    Schedule {activePlatformLabel}
                  </Button>
                </SchedulePostModal>
              )}
              {!readOnly ? (
                <>
                  <Button
                    variant="secondary"
                    className="w-full flex-1 rounded-xl border bg-muted/80 font-semibold hover:bg-muted"
                    onClick={() => handleSaveDraft(activePlatform as Platform)}
                    disabled={isSavingDraft || isGenerating || !onSaveDraft}
                  >
                    {isSavingDraft ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    {isSavingDraft
                      ? "Saving..."
                      : saveDraftLabel || "Save as Draft"}
                  </Button>
                  {mode === "draft" &&
                    activePost[activePlatform].status === "DRAFT" && (
                      <Button
                        variant="outline"
                        className="w-full flex-1 rounded-xl border-destructive bg-transparent font-semibold text-destructive transition-all hover:bg-destructive hover:text-white"
                        onClick={() =>
                          onDeleteDraft?.(activePlatform as Platform)
                        }
                        disabled={isSavingDraft || isGenerating}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete {activePlatformLabel} Draft
                      </Button>
                    )}
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
