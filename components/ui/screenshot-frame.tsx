import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ScreenshotFrame({
  src,
  alt,
  className,
  priority = false,
}: ScreenshotFrameProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 shadow-2xl bg-[#09090B] overflow-hidden w-full relative",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={900}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        className="w-full h-auto block object-top"
        priority={priority}
      />
    </div>
  );
}
