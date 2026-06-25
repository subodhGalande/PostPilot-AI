import { useState } from "react";
import { Loader2, Sparkles, X, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PostConfigurationProps {
  className?: string;
  topic: string;
  tone: string;
  postStyle: string;
  targetAudience: string;
  keywords: string[];
  onTopicChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onPostStyleChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onGenerate?: () => void;
  onStop?: () => void;
  isGenerating?: boolean;
  isTokensExhausted?: boolean;
}

export function PostConfiguration({
  className,
  topic,
  tone,
  postStyle,
  targetAudience,
  keywords,
  onTopicChange,
  onToneChange,
  onPostStyleChange,
  onTargetAudienceChange,
  onKeywordsChange,
  onGenerate,
  onStop,
  isGenerating,
  isTokensExhausted,
}: PostConfigurationProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const addKeywords = (rawValue: string) => {
    const nextKeywords = rawValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (nextKeywords.length === 0) {
      return;
    }

    onKeywordsChange(
      Array.from(
        new Set([
          ...keywords,
          ...nextKeywords.map((value) => value.toLowerCase()),
        ]),
      ),
    );
    setKeywordInput("");
  };

  const removeKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="shrink-0 border-b p-6">
        <h3 className="text-lg font-bold">Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Define the core parameters for your AI-generated content.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Topic</Label>
          <Input
            value={topic}
            onChange={(event) => {
              onTopicChange(event.target.value);
              if (validationError) {
                setValidationError(null);
              }
            }}
            placeholder="e.g. Benefits of Remote Work for Software Teams"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Tone</Label>
            <Select
              value={tone}
              onValueChange={(v) => {
                onToneChange(v);
                setValidationError(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="witty">Witty</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Post Style</Label>
            <Select
              value={postStyle}
              onValueChange={(v) => {
                onPostStyleChange(v);
                setValidationError(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long-form">Long-form Story</SelectItem>
                <SelectItem value="short-update">Short Update</SelectItem>
                <SelectItem value="listicle">Listicle</SelectItem>
                <SelectItem value="question">Question / Poll</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Target Audience</Label>
          <Select
            value={targetAudience}
            onValueChange={(v) => {
              onTargetAudienceChange(v);
              setValidationError(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech-founders">Tech Founders</SelectItem>
              <SelectItem value="hr-managers">HR Managers</SelectItem>
              <SelectItem value="product-designers">
                Product Designers
              </SelectItem>
              <SelectItem value="general">General Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Keywords</Label>
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "," || event.key === "Enter") {
                event.preventDefault();
                addKeywords(keywordInput);
              }

              if (
                event.key === "Backspace" &&
                keywordInput.length === 0 &&
                keywords.length > 0
              ) {
                removeKeyword(keywords[keywords.length - 1]);
              }
            }}
            onBlur={() => addKeywords(keywordInput)}
            placeholder="Type a keyword and press Enter"
          />

          <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-dashed bg-muted/30 p-3">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="gap-1.5 px-3 py-1"
                >
                  {keyword}
                  <button
                    type="button"
                    className="rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => removeKeyword(keyword)}
                    aria-label={`Remove ${keyword}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Add keywords to guide the post angle and phrasing.
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Use commas or Enter to create tags.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t bg-card p-6">
        {validationError && (
          <p className="mb-3 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {validationError}
          </p>
        )}
        {isGenerating ? (
          <Button
            size="lg"
            variant="destructive"
            className="flex w-full items-center gap-2 rounded-xl text-base font-bold"
            onClick={() => onStop?.()}
          >
            <Square className="size-5 fill-current" />
            Stop Generating
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex w-full items-center gap-2 rounded-xl text-base font-bold"
            onClick={() => {
              if (!topic.trim()) {
                setValidationError("Topic is required");
                return;
              }
              if (!tone) {
                setValidationError("Tone is required");
                return;
              }
              if (!postStyle) {
                setValidationError("Post style is required");
                return;
              }
              if (!targetAudience) {
                setValidationError("Target audience is required");
                return;
              }
              setValidationError(null);
              onGenerate?.();
            }}
            disabled={isTokensExhausted}
          >
            <Sparkles className="size-5" />
            {isTokensExhausted ? "Daily Limit Reached" : "Generate Post"}
          </Button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {isTokensExhausted
            ? "You've used all 10 daily generations. Come back tomorrow!"
            : "Generates one shared content idea adapted for LinkedIn and X."}
        </p>
      </div>
    </div>
  );
}
