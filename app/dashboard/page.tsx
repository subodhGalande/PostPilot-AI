"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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

export default function DashboardPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [clientDraftKey, setClientDraftKey] = useState(() =>
    createClientDraftKey(),
  );
  const [topic, setTopic] = useState(
    "Benefits of Remote Work for Software Teams",
  );
  const [tone, setTone] = useState("professional");
  const [postStyle, setPostStyle] = useState("long-form");
  const [targetAudience, setTargetAudience] = useState("tech-founders");
  const [keywords, setKeywords] = useState([
    "remote work",
    "productivity",
    "scaling",
    "teams",
  ]);
  const [generatedPostPack, setGeneratedPostPack] =
    useState<GeneratedPostPack | null>(null);
  const [clearedPlatforms, setClearedPlatforms] = useState<
    Set<"linkedin" | "x">
  >(new Set());

  const {
    submit: submitGenerate,
    isLoading: isGenerating,
    object,
  } = useObject({
    api: "/api/dashboard/generatePost",
    schema: generatedPostItemSchema,
    onFinish: ({ object }: { object: GeneratedPostItem | undefined }) => {
      if (!object) {
        toast.error(
          "The AI returned an unexpected response. Please try again.",
        );
        setIsGenerated(false);
        setGeneratedPostPack(null);
        return;
      }
      setGeneratedPostPack({
        post: {
          ...object,
          linkedin: {
            ...object.linkedin,
            status: "DRAFT",
            scheduledAt: null,
          },
          x: {
            ...object.x,
            mode: getXMode(object.x?.posts?.length ?? 0, object.x?.mode),
            posts: (object.x?.posts || []).map((p, i) => ({
              id: p.id || `x-${i + 1}`,
              content: p.content,
            })),
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
    },
    onError: (error: Error) => {
      console.error("AI Generation failed:", error);
      const classified = classifyApiError(error);
      toast.error(classified.message);

      // Clean slate on generation error
      setIsGenerated(false);
      setGeneratedPostPack(null);

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
    if (isGenerated && generatedPostPack) {
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
  ]);

  // Effect to update the preview in real-time as it streams
  useEffect(() => {
    if (object && isGenerating) {
      const partialPost: GeneratedPostItem = {
        topic: object.topic || topic,
        baseIdea: object.baseIdea || "",
        linkedin: {
          content: object.linkedin?.content || "",
          status: "DRAFT",
          scheduledAt: null,
        },
        x: {
          mode: getXMode(object.x?.posts?.length ?? 0, object.x?.mode),
          posts: (object.x?.posts || []).map((p, i) => ({
            id: `x-${i + 1}`,
            content: p?.content || "",
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
    }
  }, [object, topic, isGenerated, isGenerating]);

  const handleGenerate = () => {
    setDraftId(null);
    setDraftUpdatedAt(null);
    setGeneratedPostPack(null);
    setIsGenerated(true);
    setClientDraftKey(createClientDraftKey());
    setClearedPlatforms(new Set());
    submitGenerate({
      modelName: DEFAULT_MODEL.id,
      topic,
      tone,
      postStyle,
      targetAudience,
      keywords,
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
    <div className="relative flex flex-1 flex-col gap-6 overflow-hidden bg-slate-50/50 p-4 dark:bg-transparent md:p-6 lg:flex-row">
      <div
        className={cn(
          "w-full shrink-0 lg:w-5/12 xl:w-[450px]",
          isGenerated ? "hidden lg:flex" : "flex",
        )}
      >
        <PostConfiguration
          className="w-full self-start"
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
          isGenerating={isGenerating}
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
