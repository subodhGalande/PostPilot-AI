"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-6 text-slate-900">
          <div className="flex max-w-md flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">A critical error occurred!</h2>
              <p className="mt-2 text-sm text-slate-500">
                We're sorry, but something went seriously wrong.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
