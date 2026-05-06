"use client";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { PlainTextPostEditor } from "@/components/ui/plain-text-post-editor";
import type { GeneratedPostItem } from "@/lib/social-posts";
import { copyLinkedInContent, countWords } from "@/lib/post-content";

interface LinkedInPostPreviewProps {
  postStyle?: string;
  targetAudience?: string;
  post: GeneratedPostItem;
  onChange: (content: string) => void;
}

export function LinkedInPostPreview({
  postStyle,
  targetAudience,
  post,
  onChange,
}: LinkedInPostPreviewProps) {
  const linkedInContent = post.linkedin.content || "";
  const wordCount = countWords(linkedInContent);

  const handleCopy = async () => {
    try {
      await copyLinkedInContent(linkedInContent);
      toast.success("LinkedIn post copied.");
    } catch (error) {
      console.error("Failed to copy LinkedIn post", error);
      toast.error("Failed to copy LinkedIn post.");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6 fade-in">
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Shared Idea
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {post.baseIdea}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">LinkedIn</Badge>
        {postStyle ? <Badge variant="outline">{postStyle}</Badge> : null}
        {targetAudience ? (
          <Badge variant="outline">{targetAudience}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col rounded-xl border bg-muted/40 p-4">
        <PlainTextPostEditor
          value={linkedInContent}
          onChange={onChange}
          onCopy={handleCopy}
          copyLabel="Copy for LinkedIn"
          placeholder="Write your LinkedIn post..."
        />

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs">
          <span className="font-semibold text-foreground">
            {wordCount} words
          </span>
          <span className="text-muted-foreground">
            Recommended: 120-200 words
          </span>
        </div>
      </div>
    </div>
  );
}
