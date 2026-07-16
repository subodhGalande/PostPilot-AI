"use client";

import { Button } from "@/components/ui/button";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";
import { Icons } from "@/components/ui/icons";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import SideRays from "@/components/ui/side-rays";





export function LandingHero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-background">
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
      >
        <SideRays
          className="bg-transparent"
          speed={0.8}
          rayColor1="#1A5BFF"
          rayColor2="#6366F1"
          intensity={1.2}
          spread={1.2}
          origin="top-right"
          tilt={20}
          saturation={1.8}
          blend={1.5}
          falloff={1.6}
          opacity={0.8}
        />
      </div>
      <div className="container mx-auto px-4 relative z-10 max-w-7xl mt-4 md:mt-8">
        
        {/* Top Text Block */}
        <div className="flex flex-col items-start text-left max-w-4xl mx-auto md:mx-0">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-sm font-medium text-foreground mb-8">
            <span className="font-semibold">PostPilot 1.0 is here</span>
            <span className="text-muted-foreground hidden sm:inline">See everything we shipped</span>
            <ArrowRight className="w-4 h-4 ml-1 text-muted-foreground" />
          </div>

          {/* Heading & Subheading */}
          <h1 className="animate-hero-h1 font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-5 text-balance">
            Turn your raw ideas into <span className="text-primary block mt-1 pb-1">perfect social posts.</span>
          </h1>

          <p className="animate-hero-p text-lg md:text-xl text-muted-foreground max-w-xl text-pretty mb-10 leading-relaxed font-medium tracking-tight">
            Dump your thoughts. Choose a tone. PostPilot instantly formats your ideas into native, high-converting drafts for X and LinkedIn.
          </p>

          {/* CTAs */}
          <div className="animate-hero-btns flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8 h-12 text-base font-semibold shadow-none w-full sm:w-auto">
              <Link href="/signup">
                Get started for free
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base font-medium border-border/50 bg-background hover:bg-secondary text-foreground shadow-none w-full sm:w-auto transition-colors"
            >
              <a href="/api/auth/google">
                <Icons.google className="mr-3 h-4 w-4" />
                Continue with Google
              </a>
            </Button>
          </div>
        </div>

        {/* Massive Flat Product Visual */}
        <div className="animate-hero-img w-full relative mt-12 md:mt-16 pb-10">
           <ScreenshotFrame
             src="/screenshots/generation-page.png"
             alt="PostPilot Generation Tool"
             className="w-full rounded-2xl shadow-2xl"
             priority
           />
        </div>
        
      </div>
    </section>
  );
}
