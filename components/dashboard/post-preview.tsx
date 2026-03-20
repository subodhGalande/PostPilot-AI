import { ArrowLeft, FileText, Loader2 } from "lucide-react";

import { LinkedInPostPreview } from "@/components/dashboard/linkedin-post-preview";
import { XPostPreview } from "@/components/dashboard/x-post-preview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Platform = "linkedin" | "x";

interface WritingProfile {
  name: string;
  description: string;
  industry: string;
}

interface PostPreviewProps {
  className?: string;
  platform: Platform;
  postStyle: string;
  targetAudience: string;
  generatedPost: string;
  profile: WritingProfile;
  isGenerated?: boolean;
  isGenerating?: boolean;
  onReset?: () => void;
}

export function PostPreview({
  className,
  platform,
  postStyle,
  targetAudience,
  generatedPost,
  profile,
  isGenerated = true,
  isGenerating = false,
  onReset,
}: PostPreviewProps) {
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
        <div>
          <h3 className="text-lg font-bold">Generated Preview</h3>
          <p className="text-sm text-muted-foreground">
            Preview updates for {platform === "linkedin" ? "LinkedIn" : "X"}.
          </p>
        </div>
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
              Generating your post...
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Building the hook, structure, and CTA for{" "}
              {platform === "linkedin" ? "LinkedIn" : "X"}.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-16 w-full" />
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

      {isGenerated && !isGenerating ? (
        platform === "linkedin" ? (
          <LinkedInPostPreview
            postStyle={postStyle}
            targetAudience={targetAudience}
            generatedPost={generatedPost}
            profile={profile}
          />
        ) : (
          <XPostPreview
            postStyle={postStyle}
            targetAudience={targetAudience}
            generatedPost={generatedPost}
            profile={profile}
          />
        )
      ) : null}
    </div>
  );
}
