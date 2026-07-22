"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SideRays from "@/components/ui/side-rays";

export function LandingFooter() {
  const pathname = usePathname();

  const handleHeroClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const heroElement = document.getElementById("hero");
      if (heroElement) {
        heroElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <footer className="bg-background relative overflow-hidden flex flex-col items-center min-h-[100dvh]">
      {/* Upward Bottom Light Rays */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{
          maskImage: "linear-gradient(to top, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 85%, transparent 100%)",
        }}
      >
        <SideRays
          className="bg-transparent"
          speed={0.6}
          rayColor1="#0047FF"
          rayColor2="#2563EB"
          intensity={1.5}
          spread={2.0}
          origin="bottom-left"
          tilt={42}
          saturation={1.4}
          blend={1.4}
          falloff={1.1}
          opacity={0.85}
        />
      </div>

      {/* Main CTA Section (Centered in available space) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl relative z-10"
      >
        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-6 [text-wrap:balance]">
          Ready to scale <br className="hidden md:block" /> your social
          presence?
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-xl mx-auto [text-wrap:pretty] tracking-tight mb-10">
          Join thousands of founders and creators building their audience on
          autopilot with PostPilot.
        </p>
        <Button
          asChild
          size="lg"
          className="h-14 px-8 rounded-full text-base font-semibold shadow-[0_0_40px_rgba(0,71,255,0.2)] hover:shadow-[0_0_60px_rgba(0,71,255,0.4)] hover:scale-105 transition-all duration-300"
        >
          <Link href="/signup" className="flex items-center">
            Start for free <ArrowRight className="ml-1 w-5 h-5" />
          </Link>
        </Button>
      </motion.div>

      {/* Bottom Micro-Navigation */}
      <div className="relative z-10 w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-8 pb-8 items-center text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-3 md:justify-self-start">
          <Link
            href="/#hero"
            onClick={handleHeroClick}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Icons.logo className="h-3 w-3" />
            </div>
            <span className="font-semibold text-foreground tracking-tight text-sm">
              PostPilot AI
            </span>
          </Link>
          <span className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        <nav className="flex items-center justify-center gap-6 md:justify-self-center">
          <Link
            href="/#features"
            onClick={(e) => handleAnchorClick(e, "features")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleAnchorClick(e, "faq")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/changelog"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            Changelog
          </Link>
        </nav>

        <div className="flex justify-center gap-4 md:justify-self-end">
          <Link
            href="https://x.com/sub_0dh"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="sr-only">Twitter</span>
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </Link>
          <Link
            href="https://github.com/subodhGalande"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="sr-only">GitHub</span>
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
