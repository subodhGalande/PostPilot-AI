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
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { generatedPostItemSchema } from "@/lib/schemas/social.schema";
import { cn } from "@/lib/utils";

import { type GeneratePostPayload } from "@/lib/schemas/post.schema";
import { DEFAULT_MODEL } from "@/lib/ai/models";

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
    error: generateError,
    object,
  } = useObject({
    api: "/api/dashboard/generatePost",
    schema: generatedPostItemSchema,
    onFinish: ({ object }: { object: GeneratedPostItem | undefined }) => {
      if (object) {
        setGeneratedPostPack({
          posts: [object as GeneratedPostItem],
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

  // Effect to update the preview in real-time as it streams
  useEffect(() => {
    if (object) {
      // Map partial object to GeneratedPostItem
      const partialPost: GeneratedPostItem = {
        topic: object.topic || topic,
        baseIdea: object.baseIdea || "",
        linkedin: {
          content: object.linkedin?.content || "",
        },
        x: {
          mode: object.x?.mode || "single",
          posts: (object.x?.posts || []).map((p, i) => ({
            id: `x-${i + 1}`,
            content: p?.content || "",
          })),
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
        ...(draftId && draftUpdatedAt ? { id: draftId, updatedAt: draftUpdatedAt } : {}),
        clientDraftKey,
        post: activePost,
        model: generatedPostPack.model,
      });
    },
    onSuccess: (draft) => {
      setDraftId(draft.id);
      setDraftUpdatedAt(draft.updatedAt);
      toast.success(draftId ? "Draft updated." : "Draft saved.");
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
          onSaveDraft={() => saveDraftMutation.mutate()}
          onScheduleSuccess={(data) => {
            setDraftId(data.id);
            setDraftUpdatedAt(data.updatedAt);
          }}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
