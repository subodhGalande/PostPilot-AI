"use client";

import { Sparkles, Terminal, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ProblemSolutionSection() {
  return (
    <section className="py-32 overflow-hidden relative">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-24 relative z-20">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 [text-wrap:balance] leading-tight">
            Stop staring at a<br className="hidden md:block" /> blank page.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto [text-wrap:pretty] tracking-tight">
            Writing social content shouldn't feel like a chore. We built
            PostPilot to eliminate the friction entirely.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-border to-primary/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
            {/* The Old Way */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="group bg-card rounded-3xl p-5 sm:p-8 md:p-10 border border-white/10 shadow-sm relative transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-muted-foreground">
                  The Old Way
                </h3>
              </div>

              {/* Micro UI: Blank Text Editor */}
              <div className="bg-background/80 border border-border/40 shadow-inner rounded-2xl p-6 h-64 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                <div className="flex-1 flex flex-col justify-start pt-2">
                  <div className="flex items-center font-mono text-muted-foreground text-lg">
                    <span className="mr-1">What should I post today...</span>
                    {/* Blinking Cursor */}
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "circInOut",
                      }}
                      className="w-2 h-6 bg-muted-foreground/60"
                    />
                  </div>

                  {/* Fake UI lines */}
                  <div className="mt-8 space-y-3 opacity-30">
                    <div className="h-2 w-3/4 bg-border rounded-full" />
                    <div className="h-2 w-1/2 bg-border rounded-full" />
                    <div className="h-2 w-5/6 bg-border rounded-full" />
                  </div>
                </div>

                {/* Frustration overlay (subtle) */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
              </div>
            </motion.div>

            {/* The PostPilot Way */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.15,
              }}
              className="group bg-card rounded-3xl p-5 sm:p-8 md:p-10 border border-primary/20 shadow-xl shadow-primary/5 relative transition-transform duration-500 hover:-translate-y-1 overflow-hidden"
            >
              {/* Glowing Aura */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    The PostPilot Way
                  </h3>
                </div>

                {/* Micro UI: Generation Sequence */}
                <div className="bg-background/80 border border-border/40 shadow-inner rounded-2xl p-6 h-64 flex flex-col relative overflow-hidden group-hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      Generating Drafts
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 flex flex-col gap-4 mt-2">
                    {/* Simulated text generation lines */}
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-primary/20 rounded-full overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                        />
                      </div>
                      <div className="h-3 w-11/12 bg-primary/20 rounded-full overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.2,
                          }}
                          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                        />
                      </div>
                      <div className="h-3 w-4/5 bg-primary/20 rounded-full overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.4,
                          }}
                          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                        />
                      </div>
                    </div>

                    {/* Output block */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.6,
                      }}
                      className="mt-auto bg-card border border-border rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded bg-primary/20" />
                        <div className="h-2 w-16 bg-border rounded-full" />
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full mb-1" />
                      <div className="h-2 w-2/3 bg-muted rounded-full" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
