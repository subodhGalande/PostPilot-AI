import { LoginForm } from "@/components/login-form/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="grid h-[100dvh] grid-cols-1 lg:grid-cols-[40%_60%] bg-background overflow-hidden">
      <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12 border-r border-border/40 overflow-hidden">
        <div className="w-full max-w-sm mx-auto">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <div className="relative hidden lg:block p-4 lg:p-6 bg-background">
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/40 blur-[140px] rounded-full animate-blob mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/40 blur-[140px] rounded-full animate-blob mix-blend-screen [animation-delay:2s]" />
            <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-500/30 blur-[120px] rounded-full animate-blob mix-blend-screen [animation-delay:4s]" />
            <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-violet-500/30 blur-[120px] rounded-full animate-blob mix-blend-screen [animation-delay:6s]" />
            <div className="absolute top-[35%] left-[35%] w-[30%] h-[30%] bg-cyan-400/20 blur-[80px] rounded-full animate-pulse mix-blend-screen" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#09090b_90%)] opacity-90" />
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <h2 className="text-5xl font-medium tracking-tight text-white mb-4">
              Build your audience
              <br />
              on autopilot.
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              Generate, schedule, and publish high-quality posts that resonate
              with your followers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
