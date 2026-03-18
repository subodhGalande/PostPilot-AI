import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Linkedin,
  Twitter,
  Wand2,
  RefreshCw,
  Calendar,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface PostPreviewProps {
  className?: string;
  isGenerated?: boolean;
  isGenerating?: boolean;
  onReset?: () => void;
}

export function PostPreview({
  className,
  isGenerated = true,
  isGenerating = false,
  onReset,
}: PostPreviewProps) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      <div className="flex shrink-0 flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-2">
          {/* Mobile Back Button */}
          {isGenerated && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden shrink-0 -ml-2" 
              onClick={onReset}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <h3 className="text-lg font-bold">Generated Preview</h3>
        </div>
        <Tabs defaultValue="linkedin" className="w-full md:w-[220px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linkedin" className="text-xs font-bold gap-1.5 leading-none">
              <Linkedin className="size-3.5" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs font-bold gap-1.5 leading-none">
              <Twitter className="size-3.5" /> 
              X
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Conditionally Render Body based on State */}
      {!isGenerated && !isGenerating && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
            <FileText className="size-10 text-primary" />
          </div>
          <h4 className="mb-2 text-xl font-bold">Ready to Write</h4>
          <p className="max-w-sm text-sm text-muted-foreground">
            Fill out the configuration on the left and hit generate to create
            your first draft.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center fade-in">
          <Loader2 className="mb-4 size-10 animate-spin text-primary" />
          <h4 className="mb-2 text-lg font-bold">Crafting your post...</h4>
          <p className="text-sm text-muted-foreground">
            Our AI is formulating the perfect structure and tone.
          </p>
        </div>
      )}

      {isGenerated && !isGenerating && (
        <div className="flex min-h-0 flex-1 flex-col p-6 fade-in">
          <div className="relative flex-1 rounded-xl border bg-muted/40 p-4">
            <Textarea
              className="h-full w-full resize-none border-none bg-transparent leading-relaxed text-foreground shadow-none focus-visible:ring-0"
              placeholder="Your generated post will appear here..."
              defaultValue={`The shift to remote work isn't just a trend; it's a strategic evolution for high-growth software teams. 🚀 \n\nBy decoupling talent from geography, companies are accessing a global pool of expertise that was previously out of reach. But it's not without its challenges.\n\nHere's how top teams are maintaining high-velocity output:\n1. Async-first documentation 📝\n2. Intentional social rituals ☕\n3. Outcome-based performance metrics 📈\n\nAre you scaling remote or returning to office? Let's discuss below! 👇\n\n#RemoteWork #SoftwareEngineering #TechTrends #ScalingUp`}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">
                Character Count:
              </span>
              <span className="text-xs font-bold text-primary">453</span>
            </div>
          </div>
          {/* Action Bar */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1 font-semibold">
                <Wand2 className="mr-2 size-4" />
                Improve Post
              </Button>
              <Button variant="outline" size="lg" className="flex-1 font-semibold">
                <RefreshCw className="mr-2 size-4" />
                Regenerate
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1 font-bold">
                Save Draft
              </Button>
              <Button size="lg" className="flex-[1.5] font-bold shadow-md transition-all">
                <Calendar className="mr-2 size-4" />
                Schedule Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
