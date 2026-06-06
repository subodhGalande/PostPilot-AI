import { Skeleton } from "@/components/ui/skeleton";

export default function DraftDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 bg-slate-50/50 p-4 dark:bg-transparent md:p-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="flex h-full w-full flex-col gap-4">
        {/* Workspace Top Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card/90 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* PostPreview Skeleton (mode="draft") */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex shrink-0 items-center gap-2 border-b p-4 md:p-6">
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="hidden md:flex gap-1 rounded-lg border bg-muted p-1">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="flex flex-1 flex-col rounded-xl border bg-muted/40 p-4 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          <div className="border-t p-4 md:p-6">
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
