"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useUser } from "@/app/context/userDetailsContext";
import { PostConfiguration } from "@/components/dashboard/post-configuration";
import { PostPreview } from "@/components/dashboard/post-preview";
import { cn } from "@/lib/utils";

type Platform = "linkedin" | "x";

type GeneratePostPayload = {
  modelName: string;
  platform: Platform;
  topic: string;
  tone: string;
  postStyle: string;
  targetAudience: string;
  keywords: string[];
};

type GeneratePostResponse = {
  post: string;
  model: string;
};

export default function DashboardPage() {
  const { user } = useUser();
  const [isGenerated, setIsGenerated] = useState(false);
  const [platform, setPlatform] = useState<Platform>("linkedin");
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
  const [generatedPost, setGeneratedPost] = useState("");

  const writingProfile = {
    name: user.accountName ?? user.name,
    description:
      user.description ??
      "Add your description in onboarding to personalize your generated posts.",
    industry: user.industry ?? "Add your industry in onboarding",
  };

  const generatePostMutation = useMutation({
    mutationKey: ["generatePost"],
    mutationFn: async (
      payload: GeneratePostPayload,
    ): Promise<GeneratePostResponse> => {
      const response = await fetch("/api/dashboard/generatePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post.");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log(data);
      setGeneratedPost(data.post ?? "");
      setIsGenerated(true);
    },
    onError: (error) => {
      console.error("Failed to generate post:", error);
    },
  });

  const handleGenerate = () => {
    generatePostMutation.mutate({
      modelName: "openrouter/free",
      platform,
      topic,
      tone,
      postStyle,
      targetAudience,
      keywords,
    });
  };

  const handleReset = () => {
    setIsGenerated(false);
    setGeneratedPost("");
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
          platform={platform}
          topic={topic}
          tone={tone}
          postStyle={postStyle}
          targetAudience={targetAudience}
          keywords={keywords}
          onPlatformChange={setPlatform}
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
          className="h-full w-full"
          platform={platform}
          postStyle={postStyle}
          targetAudience={targetAudience}
          generatedPost={generatedPost}
          profile={writingProfile}
          isGenerated={isGenerated}
          isGenerating={generatePostMutation.isPending}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
