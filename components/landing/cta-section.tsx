"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-card rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl border border-border/50"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-foreground mb-6 text-balance leading-[1.1]">
              Stop writing.<br />Start curating.
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty tracking-tight">
              Join creators who are saving hours every week by generating high-quality, perfectly formatted posts in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 h-14 text-lg shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Link href="/signup">
                  Start for free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground/80 font-medium tracking-wide">
              NO CREDIT CARD REQUIRED. 10 FREE TOKENS EVERY DAY.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
