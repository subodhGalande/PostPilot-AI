import {
  Calendar,
  FileText,
  LayoutDashboard,
  LineChart,
  Settings,
  User,
  PanelLeftClose,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Icons } from "@/components/ui/icons";

export function AppMockup() {
  return (
    <div className="w-[1000px] h-[700px] bg-background rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-border overflow-hidden flex pointer-events-none select-none relative z-10">
      {/* SIDEBAR */}
      <div className="w-[260px] flex flex-col bg-sidebar border-r border-border/50 shrink-0 h-full relative z-20">
        {/* Sidebar Header */}
        <div className="flex h-[72px] shrink-0 justify-center border-b border-border/50 px-3 py-4 md:px-4">
          <div className="flex items-center gap-3 px-2 py-1.5 w-full">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
              <Icons.logo className="size-4" />
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
        </div>

        {/* Sidebar Content */}
        <div className="px-2 py-2 md:py-3 flex flex-col flex-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55 mb-2">
            Workspace
          </div>

          <div className="space-y-1.5 px-1">
            {/* Nav Item: Dashboard */}
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-transparent text-sidebar-foreground/72">
              <LayoutDashboard className="size-4" />
              <span className="font-medium text-sm">Dashboard</span>
            </div>
            {/* Nav Item: Drafts */}
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-transparent text-sidebar-foreground/72">
              <FileText className="size-4" />
              <span className="font-medium text-sm">Drafts</span>
            </div>
            {/* Nav Item: Calendar (Active) */}
            <div className="relative flex items-center gap-2 px-3 h-10 rounded-xl border border-primary/20 bg-primary/10 shadow-sm text-primary">
              <Calendar className="size-4" />
              <span className="font-medium text-sm">Calendar</span>
            </div>
            {/* Nav Item: Analytics */}
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-transparent text-sidebar-foreground/72">
              <LineChart className="size-4" />
              <span className="font-medium text-sm">Analytics</span>
            </div>
            {/* Nav Item: Settings */}
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-transparent text-sidebar-foreground/72">
              <Settings className="size-4" />
              <span className="font-medium text-sm">Settings</span>
            </div>
          </div>

          {/* Tokens Box */}
          <div className="mt-auto block pt-3 px-1">
            <div className="rounded-xl border border-sidebar-border/40 bg-sidebar-accent/20 px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
                  Daily Tokens
                </span>
                <span className="text-sm font-bold text-sidebar-foreground/80">
                  6
                  <span className="text-xs font-normal text-sidebar-foreground/45">
                    /10
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border/40">
                <div className="h-full rounded-full bg-primary w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border/50 p-3 md:p-4">
          <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/40 bg-sidebar-accent/20 px-3 py-3 shadow-sm">
            <div className="size-10 shrink-0 rounded-full bg-muted shadow-sm ring-2 ring-sidebar-accent ring-offset-1 ring-offset-sidebar flex items-center justify-center">
              <User className="size-4 text-sidebar-foreground/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                John Doe
              </p>
              <p className="truncate text-[13px] font-medium text-sidebar-foreground/60">
                john@example.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
        {/* Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl border border-border flex items-center justify-center">
              <PanelLeftClose className="size-4 text-muted-foreground" />
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Content Calendar
              </h1>
              <p className="hidden text-sm text-muted-foreground md:block">
                View and manage your scheduled social media posts.
              </p>
            </div>
          </div>
        </header>

        {/* Calendar Main Content (Mimicking FullCalendar) */}
        <div className="flex-1 p-6 md:p-6 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
            {/* FullCalendar Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex gap-1">
                <div className="flex h-9 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium">
                  <ChevronLeft className="size-4 text-muted-foreground" />
                </div>
                <div className="flex h-9 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium">
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
                <div className="flex h-9 items-center justify-center rounded-md border bg-transparent px-4 text-sm font-medium ml-1">
                  today
                </div>
              </div>

              <h2 className="text-lg font-semibold">October 2026</h2>

              <div className="flex">
                <div className="flex h-9 items-center justify-center rounded-l-md border bg-primary text-primary-foreground px-4 text-sm font-medium">
                  month
                </div>
                <div className="flex h-9 items-center justify-center border-y border-r bg-transparent px-4 text-sm font-medium text-muted-foreground">
                  week
                </div>
                <div className="flex h-9 items-center justify-center rounded-r-md border-y border-r bg-transparent px-4 text-sm font-medium text-muted-foreground">
                  day
                </div>
              </div>
            </div>

            {/* FullCalendar Grid */}
            <div className="flex-1 flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-border/50 text-sm font-semibold text-center py-2 text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid Rows (Showing 2 rows for the mockup) */}
              <div className="grid grid-cols-7 flex-1">
                {/* Week 1 */}
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 text-muted-foreground bg-muted/20 text-xs text-right pr-2 pt-2">
                  27
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 text-muted-foreground bg-muted/20 text-xs text-right pr-2 pt-2">
                  28
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-slate-100/70 border-slate-300/50 opacity-60">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-slate-500/10 text-slate-700">
                          <Twitter className="size-3" />
                        </div>
                      </div>
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[11px] font-semibold leading-tight text-foreground">
                      Published: Welcome to PostPilot
                    </span>
                  </div>
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 text-muted-foreground bg-muted/20 text-xs text-right pr-2 pt-2">
                  29
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 text-muted-foreground bg-muted/20 text-xs text-right pr-2 pt-2">
                  30
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  1
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-blue-50/60 border-blue-200/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-blue-500/10 text-blue-600">
                          <Linkedin className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          10:00 AM
                        </span>
                      </div>
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[12px] font-semibold leading-tight text-foreground">
                      Why I switched to Next.js 14
                    </span>
                  </div>
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  2
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-blue-50/60 border-blue-200/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-blue-500/10 text-blue-600">
                          <Linkedin className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          9:00 AM
                        </span>
                      </div>
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[12px] font-semibold leading-tight text-foreground">
                      Q3 Feature Launch
                    </span>
                  </div>
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-slate-100/70 border-slate-300/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-slate-500/10 text-slate-700">
                          <Twitter className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          2:00 PM
                        </span>
                      </div>
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[11px] font-semibold leading-tight text-foreground">
                      We are live on ProductHunt!
                    </span>
                  </div>
                </div>
                <div className="border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  3
                </div>

                {/* Week 2 */}
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  4
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  5
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-slate-100/70 border-slate-300/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-slate-500/10 text-slate-700">
                          <Twitter className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          DRAFT
                        </span>
                      </div>
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[12px] font-semibold leading-tight text-foreground">
                      Engineering at scale
                    </span>
                  </div>
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  6
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-slate-100/70 border-slate-300/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-slate-500/10 text-slate-700">
                          <Twitter className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          DRAFT
                        </span>
                      </div>
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[12px] font-semibold leading-tight text-foreground">
                      5 API design tips
                    </span>
                  </div>
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  7
                  <div className="mt-1 group flex w-full flex-col gap-1.5 rounded-lg border p-1.5 text-left text-card-foreground shadow-sm bg-blue-50/60 border-blue-200/50">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 bg-blue-500/10 text-blue-600">
                          <Linkedin className="size-3" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          11:30 AM
                        </span>
                      </div>
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="line-clamp-1 min-w-0 text-[12px] font-semibold leading-tight text-foreground">
                      Hiring: Senior Devs
                    </span>
                  </div>
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  8
                </div>
                <div className="border-r border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium bg-blue-50/30 text-blue-600 text-xs text-right pr-2 pt-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center self-end">
                    9
                  </span>
                </div>
                <div className="border-b border-border/50 p-1 relative flex flex-col gap-1 font-medium text-xs text-right pr-2 pt-2">
                  10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle overlay gradient to fade out bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-30" />
    </div>
  );
}
