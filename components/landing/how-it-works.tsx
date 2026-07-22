"use client";

import {
  Lightbulb,
  PenTool,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Linkedin,
  Twitter,
} from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Simple 3-Step Process
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tighter text-foreground mb-6 text-balance">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty tracking-tight">
            From a raw thought to a perfectly formatted post across multiple
            platforms in three simple steps.
          </p>
        </div>

        <div className="flex flex-col gap-24 lg:gap-32 relative">
          {/* STEP 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="group relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full"
          >
            {/* Text Column */}
            <div className="flex-1 relative z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-muted-foreground shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Step 01
                </div>
              </div>
              <h3 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-5 text-balance">
                Idea & Context
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg text-pretty max-w-xl">
                Tell the AI what you want to talk about. Just enter a short
                idea, choose your desired tone, target audience, and key
                takeaways.
              </p>
            </div>

            {/* Visual Component 1: Interactive Prompt Card */}
            <div className="flex-1 w-full relative">
              <div className="bg-card/80 rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group-hover:border-primary/30 transition-colors">
                <div className="space-y-4">
                  <div className="bg-background rounded-2xl p-4 border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-2 font-mono">
                      Your Raw Idea:
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      "3 lessons learned scaling an AI app to 10k users without
                      spending $1 on ads."
                      <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Tone: Founder
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                      Audience: Creators
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                      Format: Detailed
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                      <Sparkles className="w-4 h-4" /> Generate Platform Posts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="group relative flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 w-full"
          >
            {/* Text Column */}
            <div className="flex-1 relative z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-muted-foreground shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Step 02
                </div>
              </div>
              <h3 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-5 text-balance">
                Draft & Refine
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg text-pretty max-w-xl">
                PostPilot generates high-quality, native drafts for both X and
                LinkedIn simultaneously, maintaining your core message with
                platform-specific formatting.
              </p>
            </div>

            {/* Visual Component 2: Dual Platform Output Card */}
            <div className="flex-1 w-full relative">
              <div className="bg-card/80 rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group-hover:border-primary/30 transition-colors">
                {/* Platform selector header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-blue-400" />{" "}
                      LinkedIn
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5" /> X (Thread)
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Draft Ready
                  </span>
                </div>

                {/* Generated Content Body */}
                <div className="bg-background rounded-2xl p-5 border border-white/5 space-y-3">
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                    🚀 Scaling an AI app to 10k users without paid ads comes
                    down to 3 non-obvious rules:
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    1. Build public build-in logs on X.
                    <br />
                    2. Turn your core prompt into a free tool.
                    <br />
                    3. Optimize for word-of-mouth loops.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="group relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full"
          >
            {/* Text Column */}
            <div className="flex-1 relative z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                  <Copy className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-muted-foreground shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Step 03
                </div>
              </div>
              <h3 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-5 text-balance">
                Manage & Copy
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg text-pretty max-w-xl">
                Manage your post lifecycles directly. Your posts are formatted
                and ready for 1-click copying. No extra formatting required.
              </p>
            </div>

            {/* Visual Component 3: 1-Click Copy & Management Action Card */}
            <div className="flex-1 w-full relative">
              <div className="bg-card/80 rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group-hover:border-primary/30 transition-colors">
                <div className="space-y-4">
                  {/* Copy Banner Feedback */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Copied to Clipboard!
                        </div>
                        <div className="text-xs text-emerald-400/80">
                          Formatted for LinkedIn & ready to paste
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Just now
                    </span>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-background border border-white/5 rounded-xl text-xs font-semibold text-foreground flex items-center gap-2">
                      <Copy className="w-4 h-4 text-primary" /> Copy Raw Text
                    </div>
                    <div className="p-3.5 bg-background border border-white/5 rounded-xl text-xs font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" /> Move to
                      Calendar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
