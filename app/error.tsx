"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-background to-background" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex max-w-lg flex-col items-center gap-8 rounded-3xl border bg-card p-10 text-center shadow-2xl"
      >
        <motion.div 
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5"
        >
          <AlertCircle className="h-10 w-10" />
        </motion.div>

        <div className="space-y-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold tracking-tight"
          >
            System Error
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-sm text-sm text-muted-foreground leading-relaxed"
          >
            {error.message || "An unexpected error occurred while loading this page. We've logged the issue and are looking into it."}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button onClick={() => reset()} size="lg" className="gap-2 rounded-xl">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
