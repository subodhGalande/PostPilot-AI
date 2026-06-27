"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { toast } from "sonner";

import { PostConfiguration } from "@/components/dashboard/post-configuration";
import { PostPreview } from "@/components/dashboard/post-preview";
import {
  createClientDraftKey,
  saveDraft,
  type SaveDraftResponse,
} from "@/lib/drafts";
import { classifyApiError } from "@/lib/errors";
import { useTokens } from "@/lib/hooks/use-tokens";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { generatedPostItemSchema } from "@/lib/schemas/social.schema";
import { cn } from "@/lib/utils";

import { DEFAULT_MODEL } from "@/lib/ai/models";

const DRAFT_STATE_KEY = "postpilot-draft-state";

interface DraftState {
  topic: string;
  tone: string;
  postStyle: string;
  targetAudience: string;
  keywords: string[];
  generatedPostPack: GeneratedPostPack | null;
  isGenerated: boolean;
  clientDraftKey: string;
  draftId: string | null;
  draftUpdatedAt: string | null;
  clearedPlatforms: ("linkedin" | "x")[];
}

function saveDraftState(state: DraftState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DRAFT_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save draft state:", e);
  }
}

function loadDraftState(): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(DRAFT_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Failed to load draft state:", e);
    return null;
  }
}

function clearDraftState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_STATE_KEY);
}

function getXMode(postCount: number, mode?: "single" | "thread") {
  return mode ?? (postCount > 1 ? "thread" : "single");
}

function stripMarkdown(text: string): string {
  if (!text) return text;
  // Strip bold/italic markdown (** and __)
  return text.replace(/(\*\*|__)/g, "");
}

function detectStuttering(post: GeneratedPostItem): boolean {
  const texts: (string | undefined)[] = [post.baseIdea, post.linkedin?.content];
  if (post.x?.posts) {
    for (const p of post.x.posts) {
      texts.push(p.content);
    }
  }

  for (const raw of texts) {
    if (!raw) continue;
    const text: string = raw;

    // Repeated word: "word word word"
    if (/(\b\w{3,}\b)(?:\s+\1){2,}/i.test(text)) return true;

    // Same word >20% of total words (only if there are enough words)
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length < 30) continue;
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    for (const count of Object.values(freq)) {
      if (count > 5 && count / words.length > 0.2) return true;
    }

    // Repeated 3-word phrase (3+ occurrences)
    for (let i = 0; i < words.length - 5; i++) {
      const phrase = words.slice(i, i + 3).join(" ");
      let occurrences = 1;
      for (let j = i + 3; j < words.length - 2; j++) {
        if (words.slice(j, j + 3).join(" ") === phrase) {
          occurrences++;
          j += 2;
        }
      }
      if (occurrences >= 3) return true;
    }
  }

  return false;
}

export default function DashboardPage() {
  const retryCount = useRef(0);
  const lastGenerateInput = useRef<{
    topic: string;
    tone: string;
    postStyle: string;
    targetAudience: string;
    keywords: string[];
  } | null>(null);

  const queryClient = useQueryClient();

  const [isGenerated, setIsGenerated] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [clientDraftKey, setClientDraftKey] = useState(() =>
    createClientDraftKey(),
  );
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [postStyle, setPostStyle] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [generatedPostPack, setGeneratedPostPack] =
    useState<GeneratedPostPack | null>(null);
  const [clearedPlatforms, setClearedPlatforms] = useState<
    Set<"linkedin" | "x">
  >(new Set());
  const [tokensExhausted, setTokensExhausted] = useState(false);

  const { data: tokensData } = useTokens();

  useEffect(() => {
    if (tokensData) {
      setTokensExhausted(tokensData.remaining === 0);
    }
  }, [tokensData]);

  const {
    submit: submitGenerate,
    isLoading: isGenerating,
    object,
    stop,
  } = useObject({
    api: "/api/dashboard/generatePost",
    schema: generatedPostItemSchema,
    onFinish: ({
      object,
      error,
    }: {
      object: GeneratedPostItem | undefined;
      error?: Error;
    }) => {
      if (error) {
        // onFinish fires with an error when schema validation fails.
        // Show a toast and reset to "Ready to Write".
        toast.error(
          "The AI returned an unexpected response. Please try again.",
        );
        setIsGenerated(false);
        setGeneratedPostPack(null);
        clearDraftState();
        return;
      }

      if (!object) {
        toast.error(
          "The AI returned an unexpected response. Please try again.",
        );
        setIsGenerated(false);
        setGeneratedPostPack(null);
        clearDraftState();
        return;
      }

      const finalLinkedinContent = stripMarkdown(object.linkedin?.content || "");
      const finalXPosts = (object.x?.posts || [])
        .filter((p) => p && p.content)
        .map((p, i) => ({
          id: p.id || `x-${i + 1}`,
          content: stripMarkdown(p.content || ""),
        }));

      if (!finalLinkedinContent.trim() && finalXPosts.length === 0) {
        toast.error(
          "The AI failed to complete the post. It may have timed out or hit a limit. Please try again.",
        );
        setIsGenerated(false);
        setGeneratedPostPack(null);
        clearDraftState();
        return;
      }

      setGeneratedPostPack({
        post: {
          ...object,
          linkedin: {
            ...object.linkedin,
            content: finalLinkedinContent,
            status: "DRAFT",
            scheduledAt: null,
          },
          x: {
            ...object.x,
            mode: getXMode(finalXPosts.length, object.x?.mode),
            posts: finalXPosts,
            status: "DRAFT",
            scheduledAt: null,
          },
        } as GeneratedPostItem,
        model: DEFAULT_MODEL.id,
      });
      setDraftId(null);
      setDraftUpdatedAt(null);
      setClientDraftKey(createClientDraftKey());
      setPreviewVersion((currentVersion) => currentVersion + 1);
      setIsGenerated(true);
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
    // NOTE: onError is only called for real API/network errors (non-200 responses,
    // fetch failures). It is NEVER called when stop() is invoked because the AI SDK
    // silently swallows AbortError. Stop cleanup is handled inline.
    onError: (error: Error) => {
      console.error("AI Generation failed:", error);
      const classified = classifyApiError(error);
      toast.error(classified.message);

      // Clean slate on generation error
      setIsGenerated(false);
      setGeneratedPostPack(null);
      clearDraftState();

      if (classified.category === "daily-limit") {
        setTokensExhausted(true);
      }

      queryClient.invalidateQueries({ queryKey: ["tokens"] });

      if (classified.shouldRedirect) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    },
  });

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = loadDraftState();
    if (saved?.isGenerated && saved.generatedPostPack) {
      // Validate that the draft actually has content. If it's an empty corrupted draft, purge it.
      const hasLiContent =
        !!saved.generatedPostPack.post?.linkedin?.content?.trim();
      const hasXContent = !!saved.generatedPostPack.post?.x?.posts?.length;

      if (!hasLiContent && !hasXContent) {
        clearDraftState();
        return;
      }

      setTopic(saved.topic);
      setTone(saved.tone);
      setPostStyle(saved.postStyle);
      setTargetAudience(saved.targetAudience);
      setKeywords(saved.keywords);
      setGeneratedPostPack(saved.generatedPostPack);
      setIsGenerated(saved.isGenerated);
      setClientDraftKey(saved.clientDraftKey);
      setDraftId(saved.draftId ?? null);
      setDraftUpdatedAt(saved.draftUpdatedAt ?? null);
      if (saved.clearedPlatforms) {
        setClearedPlatforms(new Set(saved.clearedPlatforms));
      }
      setPreviewVersion((v) => v + 1);
    }
  }, []);

  // Persist to sessionStorage on changes
  useEffect(() => {
    if (isGenerated && generatedPostPack && !isGenerating) {
      saveDraftState({
        topic,
        tone,
        postStyle,
        targetAudience,
        keywords,
        generatedPostPack,
        isGenerated,
        clientDraftKey,
        draftId,
        draftUpdatedAt,
        clearedPlatforms: Array.from(clearedPlatforms),
      });
    }
  }, [
    topic,
    tone,
    postStyle,
    targetAudience,
    keywords,
    generatedPostPack,
    isGenerated,
    clientDraftKey,
    draftId,
    draftUpdatedAt,
    clearedPlatforms,
    isGenerating,
  ]);

  // Effect to update the preview in real-time as it streams
  useEffect(() => {
    if (object && isGenerating) {
      const partialPost: GeneratedPostItem = {
        topic: object.topic || topic,
        baseIdea: object.baseIdea || "",
        linkedin: {
          content: stripMarkdown(object.linkedin?.content || ""),
          status: "DRAFT",
          scheduledAt: null,
        },
        x: {
          mode: getXMode(object.x?.posts?.length ?? 0, object.x?.mode),
          posts: (object.x?.posts || []).map((p, i) => ({
            id: `x-${i + 1}`,
            content: stripMarkdown(p?.content || ""),
          })),
          status: "DRAFT",
          scheduledAt: null,
        },
      };

      setGeneratedPostPack({
        post: partialPost,
        model: DEFAULT_MODEL.id,
      });

      if (!isGenerated) {
        setIsGenerated(true);
      }

      if (detectStuttering(partialPost)) {
        console.warn("Stuttering detected mid-stream! Stopping generation.");
        stop();

        // stop() triggers AbortError which the AI SDK silently swallows —
        // onError and onFinish will NOT fire. Handle retry/cleanup inline.
        if (retryCount.current < 1) {
          retryCount.current++;
          const input = lastGenerateInput.current;
          if (input) {
            setGeneratedPostPack(null);
            setTimeout(() => {
              submitGenerate({
                modelName: DEFAULT_MODEL.id,
                ...input,
              });
            }, 10);
            return;
          }
        }

        toast.error(
          "The AI got stuck in a loop. Please try a different topic or keywords.",
        );
        setIsGenerated(false);
        setGeneratedPostPack(null);
        clearDraftState();
      }
    }
  }, [object, topic, isGenerated, isGenerating, stop]);

  const handleGenerate = () => {
    retryCount.current = 0;
    setDraftId(null);
    setDraftUpdatedAt(null);
    setGeneratedPostPack(null);
    setIsGenerated(true);
    setClientDraftKey(createClientDraftKey());
    setClearedPlatforms(new Set());
    const input = { topic, tone, postStyle, targetAudience, keywords };
    lastGenerateInput.current = input;
    submitGenerate({
      modelName: DEFAULT_MODEL.id,
      ...input,
    });
  };

  const handleReset = () => {
    clearDraftState();
    setIsGenerated(false);
    setGeneratedPostPack(null);
    setDraftId(null);
    setDraftUpdatedAt(null);
    setClientDraftKey(createClientDraftKey());
    setClearedPlatforms(new Set());
  };

  const handleUpdatePost = (
    updater: (currentPost: GeneratedPostItem) => GeneratedPostItem,
  ) => {
    setGeneratedPostPack((currentPack) => {
      if (!currentPack || !currentPack.post) {
        return currentPack;
      }

      return {
        ...currentPack,
        post: updater(currentPack.post),
      };
    });
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
    mutationKey: ["saveDraft", draftId],
    mutationFn: async (
      platform: "linkedin" | "x",
    ): Promise<SaveDraftResponse> => {
      if (!generatedPostPack || !generatedPostPack.post) {
        throw new Error("Generate a post before saving a draft.");
      }

      if (draftId && !draftUpdatedAt) {
        throw new Error(
          "Missing draft version. Refresh the draft before saving again.",
        );
      }

      return saveDraft({
        ...(draftId && draftUpdatedAt
          ? { id: draftId, updatedAt: draftUpdatedAt }
          : {}),
        clientDraftKey,
        post: generatedPostPack.post,
        model: generatedPostPack.model,
        platform,
      });
    },
    onSuccess: (draft, platform) => {
      setDraftId(draft.id);
      setDraftUpdatedAt(draft.updatedAt);
      toast.success(draftId ? "Draft updated." : "Draft saved.");

      const newClearedPlatforms = new Set(clearedPlatforms);
      newClearedPlatforms.add(platform);

      if (newClearedPlatforms.size === 2) {
        clearDraftState();
        setIsGenerated(false);
        setGeneratedPostPack(null);
        setClearedPlatforms(new Set());
        return;
      }

      setClearedPlatforms(newClearedPlatforms);

      setGeneratedPostPack((currentPack) => {
        if (!currentPack || !currentPack.post) return currentPack;

        const currentPost = currentPack.post;
        const clearedPost: GeneratedPostItem =
          platform === "linkedin"
            ? {
                ...currentPost,
                linkedin: { ...currentPost.linkedin, content: "" },
              }
            : {
                ...currentPost,
                x: { ...currentPost.x, posts: [], mode: "single" as const },
              };

        saveDraftState({
          topic,
          tone,
          postStyle,
          targetAudience,
          keywords,
          generatedPostPack: { post: clearedPost, model: currentPack.model },
          isGenerated: true,
          clientDraftKey,
          draftId: draft.id,
          draftUpdatedAt: draft.updatedAt,
          clearedPlatforms: Array.from(newClearedPlatforms),
        });

        return { post: clearedPost, model: currentPack.model };
      });
    },
    onError: (error) => {
      console.error("Failed to save draft:", error);
      const classified = classifyApiError(error);
      toast.error(classified.message);

      if (classified.shouldRedirect) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    },
  });

  return (
    <div className="relative flex flex-1 min-h-0 flex-col gap-6 overflow-hidden bg-zinc-50 dark:bg-transparent px-2 py-4 md:p-6 lg:flex-row">
      <div
        className={cn(
          "w-full shrink-0 self-start max-h-full lg:w-5/12 xl:w-[450px]",
          isGenerated ? "hidden lg:flex" : "flex",
        )}
      >
        <PostConfiguration
          className="w-full"
          topic={topic}
          tone={tone}
          postStyle={postStyle}
          targetAudience={targetAudience}
          keywords={keywords}
          onTopicChange={setTopic}
          onToneChange={setTone}
          onPostStyleChange={setPostStyle}
          onTargetAudienceChange={setTargetAudience}
          onKeywordsChange={setKeywords}
          onGenerate={handleGenerate}
          onStop={() => {
            stop();
            setIsGenerated(false);
            setGeneratedPostPack(null);
            clearDraftState();

            // Refund the consumed token since the user didn't get usable content.
            // Fire-and-forget — UI reset is already done above.
            fetch("/api/dashboard/refundToken", { method: "POST" })
              .then(() => queryClient.invalidateQueries({ queryKey: ["tokens"] }))
              .catch(() => {});
          }}
          isGenerating={isGenerating}
          isTokensExhausted={tokensExhausted}
        />
      </div>
      <div
        className={cn(
          "h-full w-full flex-1 overflow-hidden",
          !isGenerated ? "hidden lg:block" : "flex",
        )}
      >
        <PostPreview
          key={previewVersion}
          className="h-full w-full"
          postStyle={postStyle}
          targetAudience={targetAudience}
          generatedPostPack={generatedPostPack}
          onLinkedInChange={handleLinkedInChange}
          onXPostChange={handleXPostChange}
          isGenerated={isGenerated}
          isGenerating={isGenerating}
          isSavingDraft={saveDraftMutation.isPending}
          id={draftId || undefined}
          updatedAt={draftUpdatedAt || undefined}
          clientDraftKey={clientDraftKey}
          onSaveDraft={(platform) => saveDraftMutation.mutate(platform)}
          clearedPlatforms={clearedPlatforms}
          onScheduleSuccess={(data) => {
            setDraftId(data.id);
            setDraftUpdatedAt(data.updatedAt);
            toast.success("Post scheduled successfully.");

            const scheduledPlatform = data.platform;
            if (!scheduledPlatform) return;

            const newClearedPlatforms = new Set(clearedPlatforms);
            newClearedPlatforms.add(scheduledPlatform);

            if (newClearedPlatforms.size === 2) {
              clearDraftState();
              setIsGenerated(false);
              setGeneratedPostPack(null);
              setClearedPlatforms(new Set());
              return;
            }

            setClearedPlatforms(newClearedPlatforms);

            setGeneratedPostPack((currentPack) => {
              if (!currentPack || !currentPack.post) return currentPack;

              const currentPost = currentPack.post;
              const clearedPost: GeneratedPostItem =
                scheduledPlatform === "linkedin"
                  ? {
                      ...currentPost,
                      linkedin: { ...currentPost.linkedin, content: "" },
                    }
                  : {
                      ...currentPost,
                      x: {
                        ...currentPost.x,
                        posts: [],
                        mode: "single" as const,
                      },
                    };

              saveDraftState({
                topic,
                tone,
                postStyle,
                targetAudience,
                keywords,
                generatedPostPack: {
                  post: clearedPost,
                  model: currentPack.model,
                },
                isGenerated: true,
                clientDraftKey,
                draftId: data.id,
                draftUpdatedAt: data.updatedAt,
                clearedPlatforms: Array.from(newClearedPlatforms),
              });

              return { post: clearedPost, model: currentPack.model };
            });
          }}
          onReset={handleReset}
          hideStatusBadge={true}
        />
      </div>
    </div>
  );
}
