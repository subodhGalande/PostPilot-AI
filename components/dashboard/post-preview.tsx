"use client";

import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { LinkedInPostPreview } from "@/components/dashboard/linkedin-post-preview";
import { XPostPreview } from "@/components/dashboard/x-post-preview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { cn } from "@/lib/utils";

type PlatformTab = "linkedin" | "x";

interface PostPreviewProps {
  className?: string;
  postStyle: string;
  targetAudience: string;
  generatedPostPack: GeneratedPostPack | null;
  onLinkedInChange: (content: string) => void;
  onXPostChange: (postId: string, content: string) => void;
  isGenerated?: boolean;
  isGenerating?: boolean;
  onReset?: () => void;
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
  onReset,
}: PostPreviewProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("linkedin");
  const activePost: GeneratedPostItem | null =
    generatedPostPack?.posts[0] ?? null;

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
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">Generated Preview</h3>
          <p className="text-sm text-muted-foreground">
            Switch between LinkedIn and X editors for the same generated idea.
          </p>
        </div>

        {activePost ? (
          <Tabs
            value={activePlatform}
            onValueChange={(value) => setActivePlatform(value as PlatformTab)}
            className="hidden md:flex"
          >
            <TabsList>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="x">X</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
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

      {isGenerating ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-6 fade-in">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Generating your post package...
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Building a LinkedIn post and an X-ready thread from the same idea.
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

      {isGenerated && !isGenerating && activePost ? (
        <>
          <div className="border-b px-4 py-3 md:hidden">
            <Tabs
              value={activePlatform}
              onValueChange={(value) => setActivePlatform(value as PlatformTab)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                <TabsTrigger value="x">X</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activePlatform === "linkedin" ? (
            <LinkedInPostPreview
              postStyle={postStyle}
              targetAudience={targetAudience}
              post={activePost}
              onChange={onLinkedInChange}
            />
          ) : (
            <XPostPreview
              postStyle={postStyle}
              targetAudience={targetAudience}
              post={activePost}
              onPostChange={onXPostChange}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
