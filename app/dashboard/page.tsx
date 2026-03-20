"use client";

import { useState } from "react";

import { PostConfiguration } from "@/components/dashboard/post-configuration";
import { PostPreview } from "@/components/dashboard/post-preview";
import { cn } from "@/lib/utils";

type Platform = "linkedin" | "x";

const writingProfile = {
  name: "Avery Chen",
  description:
    "A growth-focused operator sharing practical lessons on content, product storytelling, and audience building.",
  industry: "B2B SaaS",
};

function generateMockPost({
  platform,
  topic,
  tone,
  postStyle,
  targetAudience,
  keywords,
}: {
  platform: Platform;
  topic: string;
  tone: string;
  postStyle: string;
  targetAudience: string;
  keywords: string[];
}) {
  const keywordHashtags = keywords
    .slice(0, platform === "linkedin" ? 4 : 2)
    .map((keyword) => `#${keyword.replace(/\s+/g, "")}`)
    .join(" ");

  if (platform === "x") {
    return `${topic} starts to work better when teams optimize for clarity, not volume.\n\nFor ${targetAudience.toLowerCase()}, a ${tone.toLowerCase()} ${postStyle.toLowerCase()} angle lands best when the takeaway is immediate and useful.\n\nWhat would you add?\n\n${keywordHashtags}`.trim();
  }

  return `${topic} becomes much easier to scale when the message is clear before the post is written.\n\nFor ${targetAudience.toLowerCase()}, a ${tone.toLowerCase()} tone paired with a ${postStyle.toLowerCase()} format helps the idea feel practical instead of abstract.\n\nA simple framework we keep coming back to:\n1. Lead with a concrete tension.\n2. Share one point of view worth remembering.\n3. End with a question that invites real discussion.\n\nWhat structure has worked best for your team lately?\n\n${keywordHashtags}`.trim();
}

export default function DashboardPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setGeneratedPost(
        generateMockPost({
          platform,
          topic,
          tone,
          postStyle,
          targetAudience,
          keywords,
        }),
      );
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setIsGenerating(false);
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
          className="h-full w-full"
          platform={platform}
          postStyle={postStyle}
          targetAudience={targetAudience}
          generatedPost={generatedPost}
          profile={writingProfile}
          isGenerated={isGenerated}
          isGenerating={isGenerating}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
