"use client";

import { Calendar, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PlainTextPostEditor } from "@/components/dashboard/plain-text-post-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratedPostItem } from "@/lib/social-posts";
import { copyLinkedInContent, countWords } from "@/lib/post-content";

interface LinkedInPostPreviewProps {
  postStyle: string;
  targetAudience: string;
  post: GeneratedPostItem;
  onChange: (content: string) => void;
}

export function LinkedInPostPreview({
  postStyle,
  targetAudience,
  post,
  onChange,
}: LinkedInPostPreviewProps) {
  const wordCount = countWords(post.linkedin.content);

  const handleCopy = async () => {
    try {
      await copyLinkedInContent(post.linkedin.content);
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
        <Badge variant="outline">{postStyle}</Badge>
        <Badge variant="outline">{targetAudience}</Badge>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border bg-muted/40 p-4">
        <PlainTextPostEditor
          value={post.linkedin.content}
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

      <div className="mt-2 flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="ghost"
            className="h-10 rounded-xl px-4 text-sm font-semibold"
          >
            <Wand2 data-icon="inline-start" />
            Improve Post
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-10 flex-1 rounded-xl text-sm font-bold shadow-md transition-all">
            <Calendar data-icon="inline-start" />
            Schedule Post
          </Button>
        </div>
      </div>
    </div>
  );
}
