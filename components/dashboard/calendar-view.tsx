"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg, EventDropArg } from "@fullcalendar/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/dashboard/confirmation-modal";
import { useState, useMemo, useCallback } from "react";

interface ScheduledPost {
  id: string;
  title: string;
  status: string;
  scheduledAt: string;
  content: any;
  clientDraftKey: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  classNames?: string[];
  extendedProps: {
    status: string;
    type: "draft" | "scheduled";
  };
}

export function CalendarView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: "unschedule" | "delete" | null;
    postId: string | null;
    postTitle: string | null;
  }>({
    isOpen: false,
    type: null,
    postId: null,
    postTitle: null,
  });

  const handleOpenConfirmation = (type: "unschedule" | "delete", postId: string, postTitle: string) => {
    setConfirmationState({ isOpen: true, type, postId, postTitle });
  };

  const handleCloseConfirmation = () => {
    setConfirmationState({ isOpen: false, type: null, postId: null, postTitle: null });
  };

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduled-posts-calendar"],
    queryFn: async (): Promise<ScheduledPost[]> => {
      const response = await fetch("/api/dashboard/drafts?status=SCHEDULED");
      if (!response.ok) throw new Error("Failed to fetch scheduled posts");
      return response.json();
    },
  });

  const unscheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/dashboard/unschedulePost", {
        method: "POST",
        body: JSON.stringify({ id }),
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
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/dashboard/drafts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post deleted.");
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
      const post = scheduledPosts?.find((p) => p.id === id);
      if (!post) throw new Error("Post not found");

      const storedContent = post.content as any;
      if (!storedContent) throw new Error("Post content not found");

      const { model, ...postData } = storedContent;

      const response = await fetch("/api/dashboard/schedulePost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          clientDraftKey: post.clientDraftKey,
          post: postData,
          model: model || "gemini-2.0-flash",
          scheduledAt: newDate,
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
    const { type, postId } = confirmationState;
    if (!postId) return;

    if (type === "unschedule") {
      unscheduleMutation.mutate(postId);
    } else if (type === "delete") {
      deleteMutation.mutate(postId);
    }
    handleCloseConfirmation();
  };

  const events = useMemo((): CalendarEvent[] => {
    return (scheduledPosts || []).map((post) => ({
      id: post.id,
      title: post.title,
      start: post.scheduledAt,
      end: new Date(new Date(post.scheduledAt).getTime() + 30 * 60000).toISOString(),
      classNames: ["scheduled-post-event"],
      extendedProps: {
        status: post.status,
        type: "scheduled",
        content: post.content,
      },
    }));
  }, [scheduledPosts]);

  const handleEventClick = (info: EventClickArg) => {
    // We now let the event content handle its own actions, 
    // but we keep a fallback redirect if the click isn't on a button
    if ((info.jsEvent.target as HTMLElement).closest(".post-action-btn")) {
      return;
    }
    router.push(`/dashboard/drafts/${info.event.id}`);
  };

  const handleDateClick = (info: DateClickArg) => {
    toast.info(`Plan a post for ${info.dateStr}`, {
      description: "Quick create coming soon!",
    });
  };

  const handleEventDrop = (info: EventDropArg) => {
    const postId = info.event.id;
    const newDate = info.event.start?.toISOString() || info.event.startStr;
    
    rescheduleMutation.mutate({ id: postId, newDate });
  };

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const postId = eventInfo.event.id;
    const postTitle = eventInfo.event.title;
    const eventContent = eventInfo.event.extendedProps.content as { linkedin?: { content?: string }; x?: { posts?: { content?: string }[] } } | null;
    
    const linkedInContent = eventContent?.linkedin?.content || "";
    const xContent = eventContent?.x?.posts?.[0]?.content || "";
    const combinedContent = [linkedInContent, xContent].filter(Boolean).join(" | ");
    const truncatedContent = combinedContent.length > 80 ? combinedContent.slice(0, 80) + "..." : combinedContent;

    return (
      <div className="scheduled-post-card group flex w-full flex-col gap-1 px-2 py-1.5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="scheduled-post-time whitespace-nowrap text-[11px] font-semibold text-primary/80">
            {eventInfo.timeText}
          </span>
          
          <div className="flex shrink-0 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 h-8 w-8 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                  title="Actions"
                  aria-label="Post actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 shadow-lg">
                <DropdownMenuItem 
                  className="cursor-pointer gap-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenConfirmation("unschedule", postId, postTitle);
                  }}
                >
                  <RotateCcw className="size-3.5 text-amber-500" />
                  <span className="text-xs">Unschedule</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="group cursor-pointer gap-2 text-red-600 focus:bg-red-600 focus:text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenConfirmation("delete", postId, postTitle);
                  }}
                >
                  <Trash2 className="size-3.5 text-red-500 group-hover:text-white focus:text-white" />
                  <span className="text-xs">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <span className="scheduled-post-title min-w-0 line-clamp-2 text-[13px] font-medium leading-tight text-foreground" title={eventInfo.event.title}>
          {eventInfo.event.title}
        </span>
        
        {truncatedContent && (
          <p className="scheduled-post-preview line-clamp-1 text-[11px] leading-snug text-muted-foreground/80">
            {truncatedContent}
          </p>
        )}
      </div>
    );
  }, [handleOpenConfirmation]);

return (
    <div className="h-full p-4 md:p-6 bg-card">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
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
      title={confirmationState.type === "delete" ? "Delete Post" : "Unschedule Post"}
      description={
        confirmationState.type === "delete"
          ? "Are you sure you want to delete this post? This action cannot be undone."
          : "Are you sure you want to move this post back to drafts? It will be unscheduled."
      }
      postTitle={confirmationState.postTitle ?? undefined}
      confirmText={confirmationState.type === "delete" ? "Delete" : "Unschedule"}
      variant={confirmationState.type === "delete" ? "destructive" : "default"}
    />
  </div>
  );
}
