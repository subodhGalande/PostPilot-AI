"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    status: string;
    type: "draft" | "scheduled";
  };
}

export function CalendarView() {
  const router = useRouter();

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduled-posts-calendar"],
    queryFn: async () => {
      return [];
    },
  });

  const events: CalendarEvent[] = (scheduledPosts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    start: post.scheduledAt,
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)",
    extendedProps: {
      status: post.status,
      type: "scheduled",
    },
  }));

  const handleEventClick = (info: any) => {
    const { type } = info.event.extendedProps;
    if (type === "scheduled" || type === "draft") {
      router.push(`/dashboard/drafts/${info.event.id}`);
    }
  };

  const handleDateClick = (info: any) => {
    toast.info(`Plan a post for ${info.dateStr}`, {
      description: "Quick create coming soon!",
    });
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
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        aspectRatio={1.8}
        editable={false}
        selectable={true}
        dayMaxEvents={true}
        nowIndicator={true}
      />
    </div>
  );
}
