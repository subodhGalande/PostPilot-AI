"use client";

import { Building2, Calendar, RefreshCw, UserRound, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "../ui/minimal-tiptap";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WritingProfile {
  name: string;
  description: string;
  industry: string;
}

interface LinkedInPostPreviewProps {
  postStyle: string;
  targetAudience: string;
  generatedPost: string;
  profile: WritingProfile;
}

export function LinkedInPostPreview({
  postStyle,
  targetAudience,
  generatedPost,
}: LinkedInPostPreviewProps) {
  const [value, setValue] = useState<Content>("");

  useEffect(() => {
    if (generatedPost) {
      const html = generatedPost
        .split(/\n+/)
        .filter((line) => line.trim().length > 0)
        .map((line) => `<p>${line}</p>`)
        .join("");
      setValue(html);
    } else {
      setValue("");
    }
  }, [generatedPost]);

  const wordCount = generatedPost.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6 fade-in">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">LinkedIn</Badge>
        <Badge variant="outline">{postStyle}</Badge>
        <Badge variant="outline">{targetAudience}</Badge>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border bg-muted/40 p-4">
        {generatedPost ? (
          <MinimalTiptapEditor
            value={value}
            onChange={setValue}
            className="w-full"
            editorContentClassName="p-5"
            output="html"
            placeholder="Enter your description..."
            autofocus={true}
            editable={true}
            editorClassName="focus:outline-hidden"
          />
        ) : null}

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
          <Button
            variant="secondary"
            className="h-10 flex-1 rounded-xl text-sm font-bold"
          >
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
