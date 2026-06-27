"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type {
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  MoreVertical,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/dashboard/confirmation-modal";
import { useState, useMemo, useCallback, useEffect } from "react";

interface LinkedInPostData {
  id: string;
  content: string | null;
  status: string;
  scheduledAt: Date | null;
}

interface XPostData {
  id: string;
  content: string | null;
  mode: string | null;
  threadPosts: unknown;
  status: string;
  scheduledAt: Date | null;
}

interface ScheduledPost {
  id: string;
  title: string;
  linkedinPost: LinkedInPostData | null;
  xPost: XPostData | null;
  topic: string;
  baseIdea: string;
  clientDraftKey: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  classNames?: string[];
  extendedProps: {
    status: string;
    type: "scheduled";
    platform: "linkedin" | "x";
    content: unknown;
    postId: string;
  };
}

export function CalendarView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: "unschedule" | "delete" | null;
    postId: string | null;
    postTitle: string | null;
    platform?: "linkedin" | "x";
  }>({
    isOpen: false,
    type: null,
    postId: null,
    postTitle: null,
  });

  const handleOpenConfirmation = useCallback(
    (
      type: "unschedule" | "delete",
      postId: string,
      postTitle: string,
      platform?: "linkedin" | "x",
    ) => {
      setConfirmationState({ isOpen: true, type, postId, postTitle, platform });
    },
    [],
  );

  const handleCloseConfirmation = () => {
    setConfirmationState({
      isOpen: false,
      type: null,
      postId: null,
      postTitle: null,
    });
  };

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduled-posts-calendar"],
    queryFn: async (): Promise<ScheduledPost[]> => {
      const response = await fetch("/api/dashboard/drafts?fetch=scheduled");
      if (!response.ok) throw new Error("Failed to fetch scheduled posts");
      return response.json();
    },
  });

  const unscheduleMutation = useMutation({
    mutationFn: async ({
      id,
      platform,
    }: {
      id: string;
      platform?: "linkedin" | "x";
    }) => {
      const response = await fetch("/api/dashboard/unschedulePost", {
        method: "POST",
        body: JSON.stringify({ id, platform }),
      });
      if (!response.ok) throw new Error("Failed to unschedule");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post moved back to drafts.");
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      platform,
    }: {
      id: string;
      platform?: "linkedin" | "x";
    }) => {
      const url = platform
        ? `/api/dashboard/drafts/${id}?platform=${platform}`
        : `/api/dashboard/drafts/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.deletedEntirePost) {
        toast.success("Post deleted.");
      } else {
        toast.success("Platform content deleted.");
      }
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete");
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({
      id,
      newDate,
      platform,
    }: {
      id: string;
      newDate: string;
      platform: "linkedin" | "x";
    }) => {
      const post = scheduledPosts?.find((p) => p.id === id);
      if (!post) throw new Error("Post not found");

      const linkedin = post.linkedinPost;
      const xPost = post.xPost;

      const linkedinContent = linkedin?.content || "";
      const xContent = xPost?.threadPosts as
        | { id: string; content: string }[]
        | null;

      const response = await fetch("/api/dashboard/schedulePost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          clientDraftKey: post.clientDraftKey,
          post: {
            topic: post.topic || "",
            baseIdea: post.baseIdea || "",
            linkedin: {
              content: linkedinContent,
              status: linkedin?.status || "DRAFT",
              scheduledAt: null,
            },
            x: {
              posts: xContent || [],
              mode: xPost?.mode || "single",
              status: xPost?.status || "DRAFT",
              scheduledAt: null,
            },
          },
          model: post.baseIdea ? "gemini-2.0-flash" : "gemini-2.0-flash",
          scheduledAt: newDate,
          platform,
          updatedAt: post.updatedAt,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reschedule");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post rescheduled successfully.");
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
    },
    onError: (error: Error) => {
      console.error("Reschedule error:", error);
      toast.error(error.message || "Failed to reschedule post");
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
    },
  });

  const handleConfirmAction = () => {
    const { type, postId, platform } = confirmationState;
    if (!postId) return;

    if (type === "unschedule") {
      unscheduleMutation.mutate({ id: postId, platform });
    } else if (type === "delete") {
      deleteMutation.mutate({ id: postId, platform });
    }
    handleCloseConfirmation();
  };

  const events = useMemo((): CalendarEvent[] => {
    const calendarEvents: CalendarEvent[] = [];

    (scheduledPosts || []).forEach((post) => {
      const linkedin = post.linkedinPost;
      const xPost = post.xPost;

      if (linkedin?.status === "SCHEDULED" && linkedin.scheduledAt) {
        const scheduledAtISO =
          linkedin.scheduledAt instanceof Date
            ? linkedin.scheduledAt.toISOString()
            : String(linkedin.scheduledAt);

        calendarEvents.push({
          id: `${post.id}-linkedin`,
          title: post.title,
          start: scheduledAtISO,
          end: new Date(
            new Date(scheduledAtISO).getTime() + 30 * 60000,
          ).toISOString(),
          classNames: ["scheduled-post-event", "platform-linkedin"],
          extendedProps: {
            status: linkedin.status,
            type: "scheduled",
            platform: "linkedin" as const,
            content: linkedin.content,
            postId: post.id,
          },
        });
      }

      if (xPost?.status === "SCHEDULED" && xPost.scheduledAt) {
        const scheduledAtISO =
          xPost.scheduledAt instanceof Date
            ? xPost.scheduledAt.toISOString()
            : String(xPost.scheduledAt);

        calendarEvents.push({
          id: `${post.id}-x`,
          title: post.title,
          start: scheduledAtISO,
          end: new Date(
            new Date(scheduledAtISO).getTime() + 30 * 60000,
          ).toISOString(),
          classNames: ["scheduled-post-event", "platform-x"],
          extendedProps: {
            status: xPost.status,
            type: "scheduled",
            platform: "x" as const,
            content: xPost.content,
            postId: post.id,
          },
        });
      }
    });

    return calendarEvents;
  }, [scheduledPosts]);

  const handleEventClick = (info: EventClickArg) => {
    // We now let the event content handle its own actions,
    // but we keep a fallback redirect if the click isn't on a button
    if ((info.jsEvent.target as HTMLElement).closest(".post-action-btn")) {
      return;
    }
    const platform = info.event.extendedProps.platform;
    router.push(
      `/dashboard/drafts/${info.event.extendedProps.postId}?platform=${platform}&from=calendar`,
    );
  };

  const handleDateClick = (info: DateClickArg) => {
    toast.info(`Plan a post for ${info.dateStr}`, {
      description: "Quick create coming soon!",
    });
  };

  const handleEventDrop = (info: EventDropArg) => {
    const postId = info.event.extendedProps.postId;
    const platform = info.event.extendedProps.platform;
    const newDate = info.event.start?.toISOString() || info.event.startStr;

    rescheduleMutation.mutate({ id: postId, newDate, platform });
  };

  const renderEventContent = useCallback(
    (eventInfo: EventContentArg) => {
      const postId = eventInfo.event.extendedProps.postId;
      const postTitle = eventInfo.event.title;
      const platform = eventInfo.event.extendedProps.platform as
        | "linkedin"
        | "x";
      const eventContent = eventInfo.event.extendedProps.content as {
        linkedin?: { content?: string };
        x?: { posts?: { content?: string }[] };
      } | null;

      const content =
        platform === "linkedin"
          ? eventContent?.linkedin?.content || ""
          : eventContent?.x?.posts?.[0]?.content || "";

      const truncatedContent =
        content.length > 80 ? `${content.slice(0, 80)}...` : content;

      const PlatformIcon = platform === "linkedin" ? Linkedin : Twitter;
      const platformPillClass =
        platform === "linkedin"
          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          : "bg-slate-500/10 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300";

      const platformCardClass =
        platform === "linkedin"
          ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40"
          : "bg-slate-100/70 dark:bg-slate-800/50 border-slate-300/50 dark:border-slate-700/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/80";

      return (
        <div className={`group flex w-full flex-col gap-1.5 rounded-lg border p-2 text-card-foreground shadow-sm transition-all duration-200 ease-out-ui hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer ${platformCardClass}`}>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
              <div
                className={`flex shrink-0 items-center justify-center rounded-sm px-1 py-0.5 ${platformPillClass}`}
              >
                <PlatformIcon className="size-3" />
              </div>
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {eventInfo.timeText}
              </span>
            </div>

            <div className="flex shrink-0 items-center opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px]"
                    title="Actions"
                    aria-label="Post actions"
                  >
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[9999] w-44 p-1 shadow-lg rounded-xl"
                >
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 rounded-lg focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConfirmation(
                        "unschedule",
                        postId,
                        postTitle,
                        platform,
                      );
                    }}
                  >
                    <RotateCcw className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Unschedule {platform === "linkedin" ? "LinkedIn" : "X"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConfirmation(
                        "delete",
                        postId,
                        postTitle,
                        platform,
                      );
                    }}
                  >
                    <Trash2 className="size-4 text-destructive/80" />
                    <span className="text-sm font-medium">
                      Delete {platform === "linkedin" ? "LinkedIn" : "X"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <span
            className="line-clamp-1 min-w-0 text-[13px] font-semibold leading-tight text-foreground"
            title={eventInfo.event.title}
          >
            {eventInfo.event.title}
          </span>

          {truncatedContent && (
            <p className="line-clamp-2 text-xs font-medium text-muted-foreground/70 leading-relaxed">
              {truncatedContent}
            </p>
          )}
        </div>
      );
    },
    [handleOpenConfirmation],
  );

  if (!mounted) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full px-2 py-4 md:p-6 bg-card">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={isMobile ? "listWeek" : "dayGridMonth"}
        headerToolbar={{
          left: isMobile ? "prev,next" : "prev,next today",
          center: "title",
          right: isMobile ? "listWeek,timeGridDay" : "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        height="auto"
        aspectRatio={1.8}
        editable={true}
        eventStartEditable={true}
        selectable={true}
        dayMaxEvents={3}
        nowIndicator={true}
        displayEventTime={true}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        eventDisplay="block"
        moreLinkClassNames="scheduled-post-more-link"
        loading={(loading) => {
          if (loading || isLoading) {
            return;
          }
        }}
      />
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={
          confirmationState.type === "delete"
            ? `Delete ${confirmationState.platform === "linkedin" ? "LinkedIn" : "X"} Post`
            : "Unschedule Post"
        }
        description={
          confirmationState.type === "delete"
            ? `Are you sure you want to delete the ${confirmationState.platform === "linkedin" ? "LinkedIn" : "X"} content? This action cannot be undone.`
            : "Are you sure you want to move this post back to drafts? It will be unscheduled."
        }
        postTitle={confirmationState.postTitle ?? undefined}
        confirmText={
          confirmationState.type === "delete" ? "Delete" : "Unschedule"
        }
        variant={
          confirmationState.type === "delete" ? "destructive" : "default"
        }
      />
    </div>
  );
}
