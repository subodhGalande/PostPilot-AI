import { SignupForm } from "@/components/signup-form/signup-form";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SideRays from "@/components/ui/side-rays";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-5 bg-background text-foreground relative overflow-hidden">
      
      {/* Left Panel (Form) */}
      <div className="relative flex flex-col items-center justify-center p-4 md:p-8 lg:col-span-2">
        {/* Aurora Background (Constrained to left side) */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          style={{ maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)" }}
        >
          <SideRays speed={0.8} intensity={0.5} opacity={0.8} rayColor1="#1A5BFF" rayColor2="#6366F1" className="bg-transparent" />
        </div>

        <div className="w-full max-w-md relative z-10 mt-12 md:mt-0">
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
        </div>
      </div>

      {/* Right Panel (Screenshot) */}
      <div className="hidden lg:flex flex-col justify-center relative p-12 bg-transparent overflow-hidden z-10 lg:col-span-3">
        {/* Decorative Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)"
          }}
        />
        
        {/* Stronger Glow Behind Screenshot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-[120%] max-w-[1000px] h-[75vh] max-h-[800px] relative rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden translate-x-8 z-10">
          <ScreenshotFrame
             src="/screenshots/generation-page.png"
             alt="PostPilot App"
             className="w-full h-full rounded-none border-0 shadow-none !bg-[#09090B]"
             priority
           />
        </div>
      </div>

    </div>
  );
}
