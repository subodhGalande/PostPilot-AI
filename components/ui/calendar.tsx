"use client";

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      fixedWeeks
      navLayout="around"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col items-center gap-2",
        month:
          "mx-auto grid w-[15.75rem] grid-cols-[2.25rem_1fr_2.25rem] gap-y-2",
        month_caption:
          "col-start-2 row-start-1 flex h-9 items-center justify-center",
        caption: "col-start-2 row-start-1 flex h-9 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "col-start-1 row-start-1 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        button_next:
          "col-start-3 row-start-1 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        month_grid: "col-span-3 w-[15.75rem] border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground flex size-9 items-center justify-center rounded-md font-normal text-[0.8rem]",
        weeks: "block",
        week: "mt-1 flex h-9 w-full",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          "p-0 font-normal aria-selected:opacity-100",
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold shadow-sm",
        today: "bg-accent/40 text-accent-foreground font-semibold ring-1 ring-inset ring-accent/50",
        outside:
          "day-outside text-muted-foreground/50 aria-selected:bg-accent/40 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-30",
        range_middle:
          "aria-selected:bg-accent/40 aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="size-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
