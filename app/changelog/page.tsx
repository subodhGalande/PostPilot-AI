import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Changelog - PostPilot AI",
  description: "New features, updates, and improvements shipped to PostPilot AI.",
};

interface ChangelogItem {
  type: "added" | "improved" | "fixed";
  text: string;
}

interface Release {
  version: string;
  date: string;
  isLatest?: boolean;
  title: string;
  description: string;
  changes: ChangelogItem[];
}

const releases: Release[] = [
  {
    version: "v1.0.0",
    date: "July 01, 2026",
    isLatest: true,
    title: "Initial Launch of PostPilot AI",
    description: "The initial release of PostPilot AI—bringing raw idea transformation and instant multi-channel social drafting.",
    changes: [
      {
        type: "added",
        text: "AI generation engine supporting customizable tones, target audiences, and keyword inputs.",
      },
      {
        type: "added",
        text: "Google OAuth 2.0 and credentials-based authentication with Jose JWT session security.",
      },
      {
        type: "added",
        text: "Daily 10-token free allowance system for founders and content creators.",
      },
      {
        type: "added",
        text: "High-performance dark theme dashboard shell with expandable sidebar navigation.",
      },
    ],
  },
];

function TypeTag({ type }: { type: ChangelogItem["type"] }) {
  switch (type) {
    case "added":
      return <span className="text-[11px] font-mono text-emerald-400/90 font-medium uppercase tracking-wider">Added</span>;
    case "improved":
      return <span className="text-[11px] font-mono text-primary/90 font-medium uppercase tracking-wider">Improved</span>;
    case "fixed":
      return <span className="text-[11px] font-mono text-amber-400/90 font-medium uppercase tracking-wider">Fixed</span>;
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <LandingHeader />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          
          {/* Minimal Editorial Header */}
          <header className="mb-16 border-b border-white/10 pb-10">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3 [text-wrap:balance]">
              Changelog
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-normal tracking-tight">
              New features, improvements, and fixes shipped to PostPilot.
            </p>
          </header>

          {/* Minimal Stream */}
          <div className="space-y-16">
            {releases.map((release) => (
              <article key={release.version} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pt-6 border-t border-white/5 first:border-0 first:pt-0">
                
                {/* Meta Column (Date & Version) */}
                <div className="md:col-span-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {release.version}
                    </span>
                    {release.isLatest && (
                      <span className="text-[10px] font-mono font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <time className="block text-xs font-mono text-muted-foreground">
                    {release.date}
                  </time>
                </div>

                {/* Content Column */}
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground mb-2">
                      {release.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {release.description}
                    </p>
                  </div>

                  {/* Minimal Pointer List */}
                  <ul className="space-y-2.5 pt-2">
                    {release.changes.map((change, idx) => (
                      <li key={idx} className="flex items-baseline gap-3 text-sm text-foreground/90 leading-relaxed">
                        <TypeTag type={change.type} />
                        <span className="text-muted-foreground/90">•</span>
                        <span>{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </article>
            ))}
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
