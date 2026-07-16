import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <header className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-[#09090B]/60 backdrop-blur-2xl shadow-2xl">
        <div className="px-6 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icons.logo className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">
              PostPilot AI
            </span>
          </div>
          
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Button asChild className="bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-full px-6 h-9 shadow-sm transition-transform hover:scale-105 active:scale-95">
              <Link href="/signup">
                Get Started
              </Link>
            </Button>
          </div>

        </div>
      </header>
    </div>
  );
}
