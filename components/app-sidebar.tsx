"use client";

import type * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Calendar,
  FileText,
  Laptop,
  LayoutDashboard,
  LineChart,
  Moon,
  Rocket,
  Settings,
  Sun,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    match: (pathname: string, from?: string | null) => pathname === "/dashboard",
  },
  {
    title: "Drafts",
    url: "/dashboard/drafts",
    icon: FileText,
    match: (pathname: string, from?: string | null) => 
      pathname.startsWith("/dashboard/drafts") && from !== "calendar",
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
    match: (pathname: string, from?: string | null) => 
      pathname.startsWith("/dashboard/calendar") || from === "calendar",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: LineChart,
    match: (pathname: string, from?: string | null) => pathname.startsWith("/analytics"),
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    match: (pathname: string, from?: string | null) => pathname.startsWith("/settings"),
  },
];

function SidebarMenuItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1.5">
      {navItems.map((item) => {
        const isActive = item.match(pathname, from);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                "h-11 rounded-xl border border-transparent px-3 text-sidebar-foreground/72 transition-all duration-200 md:h-10",
                "hover:border-sidebar-border/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                "data-[active=true]:border-primary/15 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-sm",
                "[&_svg]:text-sidebar-foreground/65 hover:[&_svg]:text-sidebar-foreground data-[active=true]:[&_svg]:text-primary",
              )}
            >
              <Link
                href={item.url}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <item.icon />
                <span className="font-medium">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme, theme } = useTheme();
  const { isMobile } = useSidebar();
  const activeTheme =
    theme === "system" ? "system" : (resolvedTheme ?? "system");
  const activeThemeLabel =
    theme === "system" ? "Auto" : activeTheme === "dark" ? "Dark" : "Light";
  const ActiveThemeIcon =
    theme === "system" ? Laptop : activeTheme === "dark" ? Moon : Sun;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border/70 p-3 md:p-4">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/35 px-3 py-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Rocket className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-tight text-sidebar-foreground">
              PostPilot AI
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              Content workspace
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 md:py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <Suspense fallback={<div className="h-40" />}>
              <SidebarMenuItems />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-3 md:p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full justify-between rounded-xl border border-sidebar-border/60 bg-sidebar-accent/20 px-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
              aria-label={`Change theme, current theme ${activeThemeLabel}`}
            >
              <span className="flex items-center gap-2">
                <ActiveThemeIcon className="size-4 text-sidebar-foreground/75" />
                <span className="font-medium">Theme</span>
              </span>
              <span className="text-xs text-sidebar-foreground/65">
                {activeThemeLabel}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side={isMobile ? "top" : "right"}
            className="w-44"
          >
            <DropdownMenuLabel>Choose theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={theme ?? "system"}
              onValueChange={(value) =>
                setTheme(value as "light" | "dark" | "system")
              }
            >
              <DropdownMenuRadioItem value="light">
                <Sun />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Laptop />
                Auto
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3 md:flex">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              Subodh
            </p>
            <p className="text-xs text-sidebar-foreground/65">
              Creator account
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
