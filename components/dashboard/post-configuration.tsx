import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";

interface PostConfigurationProps {
  className?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function PostConfiguration({ className, onGenerate, isGenerating }: PostConfigurationProps) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      <div className="shrink-0 border-b p-6">
        <h3 className="text-lg font-bold">Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Define the core parameters for your AI-generated content.
        </p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Topic</Label>
          <Input
            placeholder="e.g. Benefits of Remote Work for Software Teams"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tone</Label>
            <Select>
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
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Post Style</Label>
            <Select>
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
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Target Audience</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech-founders">Tech Founders</SelectItem>
              <SelectItem value="hr-managers">HR Managers</SelectItem>
              <SelectItem value="product-designers">Product Designers</SelectItem>
              <SelectItem value="general">General Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Keywords</Label>
          <Input
            placeholder="remote, productivity, scaling, teams"
          />
          <p className="text-xs text-muted-foreground">
            Separate keywords with commas
          </p>
        </div>
      </div>
      <div className="shrink-0 border-t bg-card p-6">
        <Button 
          size="lg" 
          className="flex w-full items-center gap-2 rounded-xl text-base font-bold"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Sparkles className="size-5" />
          )}
          {isGenerating ? "Generating..." : "Generate Post"}
        </Button>
      </div>
    </div>
  );
}
