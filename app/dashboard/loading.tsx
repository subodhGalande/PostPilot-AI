import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50/50 p-6 dark:bg-transparent">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <h2 className="text-xl font-bold">Loading Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Preparing your AI workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
