"use client";

import { motion } from "framer-motion";
import { Sparkles, CalendarDays, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "AI-Powered Generation",
    description:
      "Generate platform-specific copy for X and LinkedIn instantly.",
    icon: Sparkles,
    colSpan: "md:col-span-2",
    heightClass: "h-auto md:h-[360px]",
    delay: 0.1,
    visual: (
      <div className="flex-1 w-full bg-secondary/50 rounded-tl-xl border-t border-l border-border p-5 pb-0 shadow-sm flex flex-col gap-3 relative overflow-hidden mt-6 ml-6 border-b-0 border-r-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="h-4 w-24 bg-border rounded-sm" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded-sm" />
          <div className="h-3 w-[85%] bg-muted rounded-sm" />
          <div className="h-3 w-[60%] bg-muted rounded-sm" />
        </div>
        <div className="mt-auto pt-6 flex gap-2 border-t border-border">
          <div className="h-10 w-24 bg-primary/10 rounded-t-md border-x border-t border-primary/30" />
          <div className="h-10 w-24 bg-secondary rounded-t-md border-x border-t border-border" />
        </div>
      </div>
    ),
  },
  {
    title: "Visual Calendar",
    description: "Plan your content visually across all your social channels.",
    icon: CalendarDays,
    colSpan: "md:col-span-1",
    heightClass: "h-auto md:h-[360px]",
    delay: 0.2,
    visual: (
      <div className="flex-1 w-full mt-6 ml-6 relative overflow-hidden">
        <ScreenshotFrame
          src="/screenshots/calendar-page-v2.png"
          alt="Visual Content Calendar"
          className="w-full h-full rounded-tl-xl border-t border-l border-white/10 shadow-sm rounded-b-none rounded-r-none min-h-[220px]"
        />
      </div>
    ),
  },
  {
    title: "10 Daily Tokens Free",
    description:
      "Get 10 free AI generation tokens every single day to fuel your content pipeline.",
    icon: BarChart3,
    colSpan: "md:col-span-1",
    heightClass: "h-auto md:h-[360px]",
    delay: 0.3,
    isHighlighted: true,
    visual: (
      <div className="flex-1 w-full bg-white/20 rounded-t-xl border-t border-x border-white/30 p-6 flex flex-col justify-center items-center mt-6 mx-6 mb-0 text-center border-b-0 rounded-b-none backdrop-blur-sm">
        <div className="text-5xl font-bold text-white mb-1 tracking-tighter">
          10<span className="text-2xl text-white/60 font-normal">/10</span>
        </div>
        <div className="text-xs font-semibold text-white/80 mt-2 tracking-widest uppercase">
          Tokens Available
        </div>
        <div className="w-full h-2 bg-black/20 rounded-full mt-6 overflow-hidden">
          <div className="w-full h-full bg-white rounded-full" />
        </div>
      </div>
    ),
  },
  {
    title: "Manual Publishing Control",
    description:
      "We generate the content, you retain full control over when and how it goes live.",
    icon: Users,
    colSpan: "md:col-span-2",
    heightClass: "h-auto md:h-[360px]",
    delay: 0.4,
    visual: (
      <div className="flex-1 w-full mt-6 ml-6 relative">
        <ScreenshotFrame
          src="/screenshots/drafts-page.png"
          alt="Draft Management Workspace"
          className="absolute top-0 left-0 w-full h-full rounded-tl-xl border-t border-l border-border/50 shadow-sm rounded-b-none rounded-r-none min-h-[300px]"
        />
      </div>
    ),
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Signature Section Header - Matches reference layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="md:w-2/3">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4 leading-tight [text-wrap:balance]">
              A focused workspace for <br className="hidden md:block" /> X and
              LinkedIn.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-2xl [text-wrap:pretty] tracking-tight">
              Everything you need to draft and manage your posts, without the
              clutter of automatic scheduling.
            </p>
          </div>
          <div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-10 shadow-sm shadow-primary/20 font-medium"
            >
              <Link href="/signup">
                Start drafting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: feature.delay,
              }}
              className={`group flex flex-col rounded-2xl shadow-sm overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:shadow-xl ${feature.colSpan} ${feature.heightClass} ${
                feature.isHighlighted
                  ? "bg-primary border-primary text-white shadow-primary/20 hover:shadow-primary/30"
                  : "bg-card border-border/80 border text-foreground shadow-sm"
              }`}
            >
              <div className="p-6 pb-3 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 ${feature.isHighlighted ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3
                    className={`font-heading text-lg font-semibold tracking-tight text-balance ${feature.isHighlighted ? "text-white" : "text-foreground"}`}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p
                  className={`text-sm leading-relaxed max-w-sm text-pretty ${feature.isHighlighted ? "text-white/80" : "text-muted-foreground"}`}
                >
                  {feature.description}
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-end min-h-[160px] relative">
                {feature.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
