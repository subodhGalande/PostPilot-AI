"use client";

import type * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { motion, LayoutGroup } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  LineChart,
  Rocket,
  Settings,
  User,
} from "lucide-react";
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
import { useUserProfile } from "@/lib/hooks/use-user-profile";
import { useTokens } from "@/lib/hooks/use-tokens";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    match: (pathname: string, _from?: string | null) =>
      pathname === "/dashboard",
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
    url: "/dashboard/analytics",
    icon: LineChart,
    match: (pathname: string, _from?: string | null) =>
      pathname.startsWith("/dashboard/analytics"),
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    match: (pathname: string, _from?: string | null) =>
      pathname.startsWith("/dashboard/settings"),
  },
];

function SidebarMenuItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1.5">
      <LayoutGroup>
        {navItems.map((item) => {
          const isActive = item.match(pathname, from);

          return (
            <SidebarMenuItem key={item.title} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-tab"
                  className="absolute inset-0 z-0 rounded-xl border border-primary/20 bg-primary/10 shadow-sm"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={cn(
                  "relative z-10 h-11 overflow-hidden rounded-xl border border-transparent px-3 text-sidebar-foreground/72 transition-[color,transform] duration-150 ease-out-ui md:h-10",
                  "hover:-translate-y-0.5 hover:bg-transparent hover:text-sidebar-foreground",
                  "data-[active=true]:bg-transparent data-[active=true]:text-primary dark:data-[active=true]:text-blue-400",
                  "[&_svg]:text-sidebar-foreground/65 hover:[&_svg]:text-sidebar-foreground data-[active=true]:[&_svg]:text-primary dark:data-[active=true]:[&_svg]:text-blue-400",
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
                  <div className="relative z-10 flex items-center gap-2">
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </LayoutGroup>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const _pathname = usePathname();
  useSidebar();
  const { data: user } = useUserProfile();
  const { data: tokens } = useTokens();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex h-[72px] shrink-0 justify-center border-b border-border/50 px-3 py-4 md:px-4">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <Rocket className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
              PostPilot AI
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/60">
              Workspace
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 md:py-3 flex flex-col">
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

        {tokens && (
          <div className="mt-auto hidden md:block pt-3 px-1">
            <div className="rounded-xl border border-sidebar-border/40 bg-sidebar-accent/20 px-3 py-2.5 shadow-sm transition-[transform,box-shadow,background-color] duration-150 ease-out-ui hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
                  Daily Tokens
                </span>
                <span className="text-sm font-bold text-sidebar-foreground/80">
                  {tokens.remaining}
                  <span className="text-xs font-normal text-sidebar-foreground/45">
                    /{tokens.total}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border/40">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out-ui"
                  style={{
                    width: `${(tokens.remaining / tokens.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3 md:p-4">
        <Link href="/dashboard/profile">
          <div className="hidden items-center gap-3 rounded-xl border border-sidebar-border/40 bg-sidebar-accent/20 px-3 py-3 shadow-sm transition-[transform,box-shadow,background-color] duration-150 ease-out-ui md:flex hover:-translate-y-0.5 hover:bg-sidebar-accent/40 hover:shadow-md">
            <Avatar
              src={user?.avatarUrl ?? null}
              alt={user?.name ?? ""}
              className="size-10 shrink-0 shadow-sm ring-2 ring-sidebar-accent ring-offset-1 ring-offset-sidebar transition duration-150 ease-out-ui"
            >
              {user?.name ? (
                <span className="text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="size-4" />
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="truncate text-[13px] font-medium text-sidebar-foreground/60">
                {user?.email}
              </p>
            </div>
          </div>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
