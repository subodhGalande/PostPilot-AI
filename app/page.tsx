import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { ProblemSolutionSection } from "@/components/landing/problem-solution";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground flex flex-col font-sans">
      <LandingHeader />
      <main className="flex-1 flex flex-col overflow-x-hidden">
        <LandingHero />
        <ProblemSolutionSection />
        <FeaturesBento />
        <HowItWorksSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
