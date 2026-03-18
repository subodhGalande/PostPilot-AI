"use client";

import { useState } from "react";
import { PostConfiguration } from "@/components/dashboard/post-configuration";
import { PostPreview } from "@/components/dashboard/post-preview";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // Call useUser or other hooks if needed here
  
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Fake API generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setIsGenerating(false);
  };

  return (
    <div className="relative flex flex-1 flex-col lg:flex-row gap-6 overflow-hidden p-4 md:p-6 bg-slate-50/50 dark:bg-transparent">
      {/* Mobile Configuration (Visible initially) & Desktop Configuration (Always visible) */}
      <div 
        className={cn(
          "w-full lg:w-5/12 xl:w-[450px] shrink-0",
          isGenerated ? "hidden lg:flex" : "flex h-full"
        )}
      >
        <PostConfiguration 
          className="w-full h-full" 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      </div>

      {/* Main Preview Screen (Hidden initially on Mobile, Always visible on Desktop) */}
      <div 
        className={cn(
          "flex-1 w-full h-full overflow-hidden",
          !isGenerated ? "hidden lg:block" : "flex"
        )}
      >
        <PostPreview 
          className="h-full w-full" 
          isGenerated={isGenerated} 
          isGenerating={isGenerating}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
