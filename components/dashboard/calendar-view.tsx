"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/dashboard/confirmation-modal";
import { useState } from "react";

interface ScheduledPost {
  id: string;
  title: string;
  status: string;
  scheduledAt: string;
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

  const events: CalendarEvent[] = (scheduledPosts || []).map((post) => ({

    id: post.id,
    title: post.title,
    start: post.scheduledAt,
    classNames: ["scheduled-post-event"],
    extendedProps: {
      status: post.status,
      type: "scheduled",
    },
  }));

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

  const renderEventContent = (eventInfo: EventContentArg) => {
    const postId = eventInfo.event.id;
    const postTitle = eventInfo.event.title;
    return (
      <div className="scheduled-post-card relative flex flex-col gap-1">
        <div className="overflow-hidden">
          <span className="scheduled-post-meta">
            <span className="scheduled-post-dot" />
            <span className="scheduled-post-time">{eventInfo.timeText}</span>
          </span>
          <span className="scheduled-post-title truncate block">{eventInfo.event.title}</span>
        </div>
        
        <div className="absolute top-1 right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-5 h-5 w-5 p-0 post-action-btn opacity-0 hover:opacity-100 transition-opacity bg-primary/20 hover:bg-primary/40 text-primary">
                ...
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfirmation("unschedule", postId, postTitle);
                }}
              >
                <RotateCcw className="mr-2 size-4" />
                Unschedule
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfirmation("delete", postId, postTitle);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full p-4 md:p-6 bg-card">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
      height="auto"
      aspectRatio={1.8}
      editable={false}
      selectable={true}
      dayMaxEvents={true}
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
