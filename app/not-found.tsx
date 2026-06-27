"use client";

import Link from "next/link";
import { FileQuestion, MoveLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-background to-background dark:from-slate-800/50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex max-w-lg flex-col items-center gap-8 text-center"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 shadow-inner dark:bg-slate-900"
        >
          <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-800" />
          <motion.div
            animate={{ 
              rotateZ: [0, -5, 5, -5, 0],
              y: [0, -4, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FileQuestion className="h-14 w-14 text-slate-400 dark:text-slate-500" />
          </motion.div>
        </motion.div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            404
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-medium text-slate-700 dark:text-slate-300"
          >
            Page Not Found
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto max-w-sm text-base text-muted-foreground"
          >
            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="outline" className="gap-2 rounded-xl">
            <Link href="javascript:history.back()">
              <MoveLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild size="lg" className="gap-2 rounded-xl">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
