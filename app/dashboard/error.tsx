"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50/50 p-6 dark:bg-transparent">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message ||
              "An unexpected error occurred while loading your dashboard."}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
