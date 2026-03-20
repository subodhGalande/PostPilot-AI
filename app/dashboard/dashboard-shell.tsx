"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { OnboardingDialog } from "@/components/onboarding-dialog/onboarding-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import { useUser } from "../context/userDetailsContext";

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRouteMeta(pathname: string) {
  if (pathname === "/dashboard") {
    return {
      section: "Workspace",
      title: "Dashboard",
      description: "Create, preview, and manage your social content drafts.",
    };
  }

  if (pathname.startsWith("/calendar")) {
    return {
      section: "Planning",
      title: "Calendar",
      description:
        "Review scheduled content and manage your publishing cadence.",
    };
  }

  if (pathname.startsWith("/analytics")) {
    return {
      section: "Insights",
      title: "Analytics",
      description:
        "Track performance trends and understand what content lands.",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      section: "Preferences",
      title: "Settings",
      description: "Adjust your workspace, profile, and platform preferences.",
    };
  }

  const segments = pathname.split("/").filter(Boolean);
  const title =
    segments.length > 0
      ? formatSegment(segments[segments.length - 1])
      : "Dashboard";

  return {
    section:
      segments.length > 1
        ? formatSegment(segments[segments.length - 2])
        : "Workspace",
    title,
    description: "Manage your workspace and content operations.",
  };
}

function DashboardHeader() {
  const pathname = usePathname();
  const { isMobile, state, toggleSidebar } = useSidebar();
  const routeMeta = getRouteMeta(pathname);
  const { user } = useUser();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 md:gap-4 md:px-6">
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

      <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-2.5 py-1.5 md:hidden">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-3.5" />
        </div>
        <span className="max-w-24 truncate text-sm font-medium text-foreground">
          {user.name ?? "Account"}
        </span>
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
