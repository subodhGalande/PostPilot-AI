"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { AppSidebar } from "@/components/app-sidebar";
import { OnboardingDialog } from "@/components/onboarding-dialog/onboarding-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import { useUser } from "../context/userDetailsContext";
import type { DateRange } from "@/lib/analytics/types";

import { ReadonlyURLSearchParams } from "next/navigation";

function getRouteMeta(
  pathname: string,
  searchParams?: ReadonlyURLSearchParams,
) {
  if (pathname.startsWith("/dashboard/drafts/")) {
    const isFromCalendar = searchParams?.get("from") === "calendar";

    if (isFromCalendar) {
      return {
        section: "Workspace",
        title: "Scheduled Post",
        description:
          "Review your scheduled post. Unschedule it to move it back to drafts and make edits.",
      };
    }

    return {
      section: "Workspace",
      title: "Post Editor",
      description:
        "Refine your post and keep LinkedIn and X edits in one shared workspace.",
    };
  }

  if (pathname.startsWith("/dashboard/drafts")) {
    return {
      section: "Workspace",
      title: "Drafts",
      description:
        "Browse saved drafts and reopen them in the shared editor workspace.",
    };
  }

  if (pathname.startsWith("/dashboard/calendar")) {
    return {
      section: "Planning",
      title: "Content Calendar",
      description: "View and manage your scheduled social media posts.",
    };
  }

  if (pathname.startsWith("/dashboard/analytics")) {
    return {
      section: "Insights",
      title: "Analytics",
      description:
        "Track performance trends and understand what content lands.",
    };
  }

  if (pathname.startsWith("/dashboard/profile")) {
    return {
      section: "Account",
      title: "Profile",
      description: "View and manage your account information.",
    };
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return {
      section: "Preferences",
      title: "Settings",
      description: "Adjust your workspace, profile, and platform preferences.",
    };
  }

  return {
    section: "Workspace",
    title: "Dashboard",
    description: "Create, preview, and manage your social content drafts.",
  };
}

function AnalyticsRangePickerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!pathname.startsWith("/dashboard/analytics")) return null;

  const currentRange = (searchParams.get("range") as DateRange) || "30d";

  const handleChange = (range: DateRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="hidden md:block">
        <DateRangePicker value={currentRange} onChange={handleChange} />
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0 rounded-xl"
            >
              <CalendarIcon className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-8">
            <SheetHeader>
              <SheetTitle>Select Range</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex justify-center">
              <DateRangePicker value={currentRange} onChange={handleChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function AnalyticsRangePicker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsRangePickerInner />
    </Suspense>
  );
}

function DashboardHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, state, toggleSidebar } = useSidebar();
  const routeMeta = getRouteMeta(pathname, searchParams);
  const { user } = useUser();
  const [isNavigating, setIsNavigating] = useState(false);

  // Simple trick to show progress bar on pathname change
  useEffect(() => {
    void pathname; // trigger on navigation
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl md:gap-4 md:px-6">
      {/* Global Progress Bar */}
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-50 h-[2px] w-full overflow-hidden bg-primary/10">
          <div className="h-full w-full origin-left animate-[shimmer_1.5s_infinite] bg-primary" />
        </div>
      )}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-xl"
          onClick={toggleSidebar}
          aria-label={
            state === "expanded" ? "Collapse sidebar" : "Expand sidebar"
          }
        >
          {isMobile ? (
            <Menu className="size-4" />
          ) : state === "expanded" ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>

        <Separator
          orientation="vertical"
          className="hidden h-8 sm:block data-[orientation=vertical]:h-8"
        />

        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {routeMeta.title}
            </h1>
            <p className="hidden text-sm text-muted-foreground md:block">
              {routeMeta.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AnalyticsRangePicker />
        <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-2.5 py-1.5 md:hidden">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-3.5" />
          </div>
          <span className="max-w-24 truncate text-sm font-medium text-foreground">
            {user.name ?? "Account"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  if (!user.onboarded) {
    return <OnboardingDialog isOpen={true} />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
