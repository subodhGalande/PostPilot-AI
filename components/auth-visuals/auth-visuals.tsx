"use client";

import { useEffect, useRef } from "react";

export function AuthVisuals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty("--mouse-x", `${x}px`);
      containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:flex h-full w-full bg-zinc-950 overflow-hidden items-end p-12 lg:p-16 shadow-[inset_20px_0_60px_rgba(0,0,0,0.8),inset_1px_0_0_rgba(255,255,255,0.05)]"
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
    >
      {/* Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/30 blur-[120px] rounded-[100%] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/30 blur-[120px] rounded-[100%] animate-blob mix-blend-screen [animation-delay:2s]" />
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-500/20 blur-[100px] rounded-[100%] animate-blob mix-blend-screen [animation-delay:4s]" />
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-violet-500/20 blur-[100px] rounded-[100%] animate-blob mix-blend-screen [animation-delay:6s]" />
      </div>

      {/* Mouse Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
        style={{
          background: `radial-gradient(circle 800px at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.2), transparent 80%)`,
        }}
      />

      {/* Radial Dark Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#09090b_100%)] opacity-80 pointer-events-none" />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-scan" />

      {/* Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Glass Panel */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-700 ease-out hover:-translate-y-2 hover:bg-white/10">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight">
          Build your audience
          <br />
          on autopilot.
        </h2>
        <p className="text-lg text-white/70 leading-relaxed">
          Generate, schedule, and publish high-quality posts that resonate with
          your followers across multiple platforms.
        </p>
      </div>
    </div>
  );
}
