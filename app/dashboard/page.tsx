"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { PostConfiguration } from "@/components/dashboard/post-configuration";
import { PostPreview } from "@/components/dashboard/post-preview";
import type { GeneratedPostItem, GeneratedPostPack } from "@/lib/social-posts";
import { cn } from "@/lib/utils";

type GeneratePostPayload = {
  modelName: string;
  topic: string;
  tone: string;
  postStyle: string;
  targetAudience: string;
  keywords: string[];
};

export default function DashboardPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
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

  const generatePostMutation = useMutation({
    mutationKey: ["generatePost"],
    mutationFn: async (
      payload: GeneratePostPayload,
    ): Promise<GeneratedPostPack> => {
      const response = await fetch("/api/dashboard/generatePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;

        throw new Error(
          errorBody?.message ?? errorBody?.error ?? "Failed to generate post.",
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPostPack(data);
      setPreviewVersion((currentVersion) => currentVersion + 1);
      setIsGenerated(true);
    },
    onError: (error) => {
      console.error("Failed to generate post:", error);
    },
  });

  const handleGenerate = () => {
    generatePostMutation.mutate({
      modelName: "gemma-4-31b-it",
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
          isGenerating={generatePostMutation.isPending}
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
          isGenerating={generatePostMutation.isPending}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
