"use client";

import { Calendar, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PlainTextPostEditor } from "@/components/dashboard/plain-text-post-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratedPostItem } from "@/lib/social-posts";
import { copyPostContent } from "@/lib/post-content";
import { cn } from "@/lib/utils";

const X_CHARACTER_LIMIT = 240;

interface XPostPreviewProps {
  postStyle: string;
  targetAudience: string;
  post: GeneratedPostItem;
  onPostChange: (postId: string, content: string) => void;
}

export function XPostPreview({
  postStyle,
  targetAudience,
  post,
  onPostChange,
}: XPostPreviewProps) {
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
        <Badge variant="secondary">X</Badge>
        <Badge variant="outline">{postStyle}</Badge>
        <Badge variant="outline">{targetAudience}</Badge>
        <Badge variant="outline">
          {post.x.mode === "thread" ? "Thread" : "Single Post"}
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border bg-muted/40 p-4">
        <div className="flex max-h-[48rem] min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {post.x.posts.map((threadPost, index) => {
            const characterCount = threadPost.content.length;
            const isOverCharacterLimit = characterCount > X_CHARACTER_LIMIT;

            return (
              <div
                key={threadPost.id}
                className="rounded-xl border bg-background/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {post.x.mode === "thread" ? `Thread ${index + 1}` : "Post"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOverCharacterLimit
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {characterCount}/{X_CHARACTER_LIMIT}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-lg"
                      onClick={async () => {
                        try {
                          await copyPostContent(threadPost.content);
                          toast.success(
                            post.x.mode === "thread"
                              ? `Thread ${index + 1} copied.`
                              : "X post copied.",
                          );
                        } catch (error) {
                          console.error("Failed to copy X post", error);
                          toast.error("Failed to copy X post.");
                        }
                      }}
                      aria-label={
                        post.x.mode === "thread"
                          ? `Copy thread ${index + 1}`
                          : "Copy X post"
                      }
                      title={
                        post.x.mode === "thread"
                          ? `Copy thread ${index + 1}`
                          : "Copy X post"
                      }
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>

                <PlainTextPostEditor
                  value={threadPost.content}
                  onChange={(content) => onPostChange(threadPost.id, content)}
                  placeholder="Write your X post..."
                  className="mt-3"
                  autoResize
                  minEditorHeight={140}
                  maxEditorHeight={220}
                  textareaClassName="min-h-0"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs">
                  <span
                    className={cn(
                      "font-semibold",
                      isOverCharacterLimit
                        ? "text-destructive"
                        : "text-foreground",
                    )}
                  >
                    {characterCount}/{X_CHARACTER_LIMIT} characters
                  </span>
                  <span
                    className={cn(
                      isOverCharacterLimit
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {isOverCharacterLimit
                      ? "Trim this post before publishing on X."
                      : "Directly copy and paste into X."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            className="h-10 rounded-xl px-4 text-sm font-semibold"
          >
            <Wand2 data-icon="inline-start" />
            Improve Thread
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-10 flex-1 rounded-xl text-sm font-bold shadow-md transition-all">
            <Calendar data-icon="inline-start" />
            Schedule X Post
          </Button>
        </div>
      </div>
    </div>
  );
}
