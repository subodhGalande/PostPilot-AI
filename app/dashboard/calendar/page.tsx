import { Suspense } from "react";
import { redirect } from "next/navigation";

import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CalendarPage() {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-slate-50/50 dark:bg-transparent">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Calendar</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your scheduled social media posts.
        </p>
      </div>
      
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Suspense fallback={<CalendarLoader />}>
          <CalendarView />
        </Suspense>
      </div>
    </div>
  );
}

function CalendarLoader() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <Skeleton className="h-[600px] w-full rounded-md" />
    </div>
  );
}
