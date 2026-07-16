"use client";

import { Lightbulb, PenTool, Copy } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Idea & Context",
    description: "Tell the AI what you want to talk about. Just enter a short idea, choose the tone, target audience, and keywords.",
    icon: Lightbulb
  },
  {
    number: "02",
    title: "Draft & Refine",
    description: "PostPilot generates high-quality drafts for both X and LinkedIn simultaneously.",
    icon: PenTool
  },
  {
    number: "03",
    title: "Manage & Copy",
    description: "Manage your posts directly. They are perfectly formatted and ready for copy-pasting. No extra formatting required.",
    icon: Copy
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tighter text-foreground mb-6 text-balance">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty tracking-tight">
            From a raw thought to a perfectly formatted post across multiple platforms in three simple steps.
          </p>
        </div>

        <div className="flex flex-col gap-24 lg:gap-32 relative">
          {steps.map((step, index) => {
            const isEven = index % 2 === 1; // index 1 is step 2 (even)
            return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`group relative flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 w-full`}
            >
              
              {/* Text Column */}
              <div className="flex-1 relative z-10 w-full">
                <div className="relative z-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-muted-foreground shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Step {step.number}
                    </div>
                  </div>
                  
                  <h3 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6 text-balance">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed text-xl text-pretty max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Visual Column */}
              <div className="flex-1 w-full relative">
                {/* Image Container Frame */}
                <div className="bg-card/30 rounded-3xl border border-border/60 shadow-xl overflow-hidden aspect-square md:aspect-[4/3] flex items-center justify-center relative">
                   {/* Placeholder for future images */}
                   <div className="absolute inset-0 bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground/50 border border-white/5">
                     <step.icon className="w-12 h-12 mb-4 opacity-50" />
                     <span className="text-xs font-semibold tracking-widest uppercase">UI Mockup {step.number}</span>
                     <span className="text-[10px] mt-2 opacity-60">Replace with 4:3 image</span>
                   </div>
                   
                   {/* When you have images, replace the div above with: */}
                   {/* <Image src={`/mockup-${step.number}.png`} alt={step.title} fill className="object-cover" /> */}
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
