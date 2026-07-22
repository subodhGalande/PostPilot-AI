"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleHeroClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsOpen(false);
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
    setIsOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 px-4 pointer-events-none">
      {/* Main Navbar Pill */}
      <header className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl relative z-50">
        <div className="px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/#hero"
            onClick={handleHeroClick}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icons.logo className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">
              PostPilot AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              onClick={(e) => handleAnchorClick(e, "features")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#faq"
              onClick={(e) => handleAnchorClick(e, "faq")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/changelog"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
          </nav>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Log in
            </Link>

            <Button
              asChild
              className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 h-9 shadow-sm shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <Link href="/signup">Get Started</Link>
            </Button>

            {/* Mobile Hamburger Toggle Button - Clean transparent icon */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isOpen}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors focus:outline-none bg-transparent border-0 shadow-none"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto w-full max-w-5xl mt-2 bg-[#0F1117]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl md:hidden z-40"
          >
            <nav className="flex flex-col space-y-4">
              <Link
                href="/#features"
                onClick={(e) => handleAnchorClick(e, "features")}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-white/5 block"
              >
                Features
              </Link>

              <Link
                href="/#faq"
                onClick={(e) => handleAnchorClick(e, "faq")}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-white/5 block"
              >
                FAQ
              </Link>

              <Link
                href="/changelog"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-white/5 block"
              >
                Changelog
              </Link>

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-foreground bg-secondary/60 border border-white/10 rounded-full hover:bg-secondary transition-colors"
                >
                  Log in
                </Link>

                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full h-11 text-base shadow-lg shadow-primary/20"
                >
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
