import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { HighlightSection } from "@/components/landing/highlight-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/30 selection:text-primary-foreground flex flex-col font-sans">
      <LandingHeader />
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <FeaturesBento />
        <HighlightSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
