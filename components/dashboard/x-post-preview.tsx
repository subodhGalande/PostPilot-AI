import { Building2, Calendar, RefreshCw, UserRound, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WritingProfile {
  name: string;
  description: string;
  industry: string;
}

interface XPostPreviewProps {
  postStyle: string;
  targetAudience: string;
  generatedPost: string;
  profile: WritingProfile;
}

export function XPostPreview({
  postStyle,
  targetAudience,
  generatedPost,
  profile,
}: XPostPreviewProps) {
  const lines = generatedPost
    .split(/\n+/)
    .filter((line) => line.trim().length > 0);
  const hook = lines[0] ?? "";
  const body = lines.slice(1).join("\n\n");
  const characterCount = generatedPost.length;
  const isOverCharacterLimit = characterCount > 240;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6 fade-in">
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Writing as
        </p>
        <div className="mt-3 flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <UserRound className="size-4 text-muted-foreground" />
            {profile.name}
          </div>
          <p className="text-muted-foreground">{profile.description}</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-4" />
            {profile.industry}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">X</Badge>
        <Badge variant="outline">{postStyle}</Badge>
        <Badge variant="outline">{targetAudience}</Badge>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border bg-muted/40 p-4">
        <div className="rounded-lg border bg-background/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Hook
          </p>
          <p className="mt-2 text-base font-semibold leading-relaxed text-foreground">
            {hook}
          </p>
        </div>

        {body ? (
          <div className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
            {body}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs">
          <span
            className={cn(
              "font-semibold",
              isOverCharacterLimit ? "text-destructive" : "text-foreground",
            )}
          >
            {characterCount}/240 characters
          </span>
          <span
            className={cn(
              isOverCharacterLimit
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {isOverCharacterLimit
              ? "Trim this down before publishing on X."
              : "Within the X posting limit."}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" size="lg" className="font-semibold">
            <Wand2 data-icon="inline-start" />
            Improve Post
          </Button>
          <Button variant="ghost" size="lg" className="font-semibold">
            <RefreshCw data-icon="inline-start" />
            Regenerate
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1 font-bold shadow-md transition-all"
          >
            <Calendar data-icon="inline-start" />
            Schedule Post
          </Button>
          <Button variant="secondary" size="lg" className="flex-1 font-bold">
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
