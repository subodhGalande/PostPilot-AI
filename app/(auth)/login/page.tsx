import { LoginForm } from "@/components/login-form/login-form";
import { Suspense } from "react";
import { AppMockup } from "@/components/ui/app-mockup";

export default function LoginPage() {
  return (
    <div className="grid h-[100dvh] grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden relative">
      {/* Glass Mesh Background */}
      <div 
        className="absolute inset-0 hidden lg:block pointer-events-none bg-[linear-gradient(to_right,#4f46e512_1px,transparent_1px),linear-gradient(to_bottom,#4f46e512_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_75%_50%,#000_20%,transparent_100%)]"
      />

      <div className="flex flex-col justify-center p-6 md:p-10 lg:p-20 z-10">
        <div className="w-full max-w-sm mx-auto">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <div className="relative hidden lg:flex items-center justify-start pl-8 overflow-hidden z-10">
        {/* The mockup flows off the right edge, slightly scaled down and vertically centered */}
        <div className="translate-x-12 scale-[0.85] origin-left">
          <AppMockup />
        </div>
      </div>
    </div>
  );
}
