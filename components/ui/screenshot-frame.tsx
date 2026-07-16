import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ScreenshotFrame({ src, alt, className, priority = false }: ScreenshotFrameProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200/60 shadow-2xl bg-white overflow-hidden flex flex-col w-full", className)}>
      {/* Window Controls (macOS style) */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
      </div>
      
      {/* Screenshot Content Area */}
      <div className="relative w-full flex-1 bg-slate-50 min-h-[200px]">
        {/* We use next/image with fill to automatically adapt to the container's aspect ratio */}
        <Image 
          src={src} 
          alt={alt}
          fill
          priority={priority}
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
