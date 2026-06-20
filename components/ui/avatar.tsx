"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string | null;
  alt: string;
  children?: React.ReactNode;
  className?: string;
}

export function Avatar({ src, alt, children, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
      ) : (
        <AvatarPrimitive.Fallback
          className={cn(
            "flex size-full items-center justify-center rounded-full bg-primary/10 text-primary",
          )}
        >
          {children}
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  );
}
