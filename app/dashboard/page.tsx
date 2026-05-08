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
  parseStoredDraftContent,
  type SaveDraftResponse,
} from "@/lib/drafts";
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

  const {
    submit: submitGenerate,
    isLoading: isGenerating,
    object,
  } = useObject({
    api: "/api/dashboard/generatePost",
    schema: generatedPostItemSchema,
    onFinish: ({ object }: { object: GeneratedPostItem | undefined }) => {
      if (object) {
        setGeneratedPostPack({
          posts: [
            {
              ...object,
              linkedin: {
                ...object.linkedin,
                status: "DRAFT",
                scheduledAt: null,
              },
              x: {
                ...object.x,
                status: "DRAFT",
                scheduledAt: null,
              },
            } as GeneratedPostItem,
          ],
          model: DEFAULT_MODEL.id,
        });
        setDraftId(null);
        setDraftUpdatedAt(null);
        setClientDraftKey(createClientDraftKey());
        setPreviewVersion((currentVersion) => currentVersion + 1);
        setIsGenerated(true);
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
  ]);

  // Effect to update the preview in real-time as it streams
  useEffect(() => {
    if (object) {
      // Map partial object to GeneratedPostItem
      const partialPost: GeneratedPostItem = {
        topic: object.topic || topic,
        baseIdea: object.baseIdea || "",
        linkedin: {
          content: object.linkedin?.content || "",
          status: "DRAFT",
          scheduledAt: null,
        },
        x: {
          mode: object.x?.mode || "single",
          posts: (object.x?.posts || []).map((p, i) => ({
            id: `x-${i + 1}`,
            content: p?.content || "",
          })),
          status: "DRAFT",
          scheduledAt: null,
        },
      };

      setGeneratedPostPack({
        posts: [partialPost],
        model: DEFAULT_MODEL.id,
      });

      if (!isGenerated) {
        setIsGenerated(true);
      }
    }
  }, [object, topic, isGenerated]);

  const handleGenerate = () => {
    setDraftId(null);
    setDraftUpdatedAt(null);
    setClientDraftKey(createClientDraftKey());
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
  };

  const handleUpdatePost = (
    updater: (currentPost: GeneratedPostItem) => GeneratedPostItem,
  ) => {
    setGeneratedPostPack((currentPack) => {
      if (!currentPack || currentPack.posts.length === 0) {
        return currentPack;
      }

      return {
        ...currentPack,
        posts: [updater(currentPack.posts[0]), ...currentPack.posts.slice(1)],
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
    mutationFn: async (): Promise<SaveDraftResponse> => {
      if (!generatedPostPack || generatedPostPack.posts.length === 0) {
        throw new Error("Generate a post before saving a draft.");
      }

      if (draftId && !draftUpdatedAt) {
        throw new Error(
          "Missing draft version. Refresh the draft before saving again.",
        );
      }

      const activePost = generatedPostPack.posts[0];
      return saveDraft({
        ...(draftId && draftUpdatedAt
          ? { id: draftId, updatedAt: draftUpdatedAt }
          : {}),
        clientDraftKey,
        post: activePost,
        model: generatedPostPack.model,
      });
    },
    onSuccess: (draft) => {
      const wasUpdating = Boolean(draftId);

      setDraftId(draft.id);
      setDraftUpdatedAt(draft.updatedAt);

      toast.success(wasUpdating ? "Draft updated." : "Draft saved.");
    },
    onError: (error) => {
      console.error("Failed to save draft:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft.",
      );
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
          saveDraftLabel={draftId ? "Update Draft" : "Save as Draft"}
          onSaveDraft={() => saveDraftMutation.mutate()}
          onScheduleSuccess={(data) => {
            setDraftId(data.id);
            setDraftUpdatedAt(data.updatedAt);

            if (data.content) {
              const updatedContent = parseStoredDraftContent(data.content);

              setGeneratedPostPack({
                posts: [updatedContent],
                model: updatedContent.model,
              });
            }
          }}
          onReset={handleReset}
          hideStatusBadge={true}
        />
      </div>
    </div>
  );
}
