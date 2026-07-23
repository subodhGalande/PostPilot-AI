import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us - PostPilot AI",
  description:
    "Have a question, feedback, or feature suggestion for PostPilot AI? Get in touch with us directly.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <LandingHeader />

      <main className="flex-1 pt-28 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Header Section */}
          <header className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-mono text-muted-foreground">
              Direct Support & Feedback
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground [text-wrap:balance]">
              Contact Us
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed [text-wrap:pretty]">
              Have a query, feature suggestion, or feedback on PostPilot AI?
              We&apos;d love to hear from you!
            </p>
          </header>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
