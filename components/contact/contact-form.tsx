"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const TOPICS = [
  { id: "query", label: "General Query", icon: "💬" },
  { id: "suggestion", label: "Feature Suggestion", icon: "💡" },
  { id: "feedback", label: "Product Feedback", icon: "📣" },
  { id: "bug", label: "Bug Report", icon: "🐞" },
];

export function ContactForm() {
  const [topic, setTopic] = useState("query");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setIsSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-2xl bg-card/60 border border-emerald-500/30 backdrop-blur-md text-center space-y-4 shadow-xl"
          >
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Message Sent!
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Thank you for reaching out. We have received your submission and
              will get back to your email shortly.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="mt-4 border-white/10 hover:bg-white/5 rounded-full px-6"
            >
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-2xl bg-card/60 border border-white/10 backdrop-blur-md shadow-2xl space-y-6"
          >
            {/* Topic Selector Pills */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Inquiry Topic
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TOPICS.map((item) => {
                  const isActive = topic === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTopic(item.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                        isActive
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "bg-secondary/40 border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="contact-name"
                  className="text-xs font-medium text-foreground"
                >
                  Your Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-secondary/40 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contact-email"
                  className="text-xs font-medium text-foreground"
                >
                  Your Email <span className="text-primary">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/40 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contact-subject"
                className="text-xs font-medium text-foreground"
              >
                Subject <span className="text-primary">*</span>
              </Label>
              <Input
                id="contact-subject"
                type="text"
                placeholder={
                  topic === "suggestion"
                    ? "e.g., Idea for scheduling LinkedIn carousels"
                    : topic === "bug"
                      ? "e.g., Error when saving drafts"
                      : topic === "feedback"
                        ? "e.g., Thoughts on the AI post generator"
                        : "e.g., Question about token limits"
                }
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-secondary/40 border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contact-message"
                className="text-xs font-medium text-foreground"
              >
                Message <span className="text-primary">*</span>
              </Label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Share your thoughts, suggestions, or queries in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-secondary/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </div>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
