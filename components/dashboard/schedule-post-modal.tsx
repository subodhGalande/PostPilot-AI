"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Minus, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  schedulePost,
  type SaveDraftResponse,
  type SchedulePostPayload,
} from "@/lib/drafts";
import { classifyApiError } from "@/lib/errors";
import type { GeneratedPostItem } from "@/lib/social-posts";

interface SchedulePostModalProps {
  children: React.ReactNode;
  post: GeneratedPostItem;
  model: string;
  clientDraftKey: string;
  id?: string;
  updatedAt?: string;
  platform?: "linkedin" | "x";
  onSuccess?: (data: SaveDraftResponse) => void;
}

function getNextScheduleDate() {
  const nextDate = new Date();
  const minutes = nextDate.getMinutes();

  nextDate.setSeconds(0, 0);

  if (minutes < 30) {
    nextDate.setMinutes(30);
  } else {
    nextDate.setHours(nextDate.getHours() + 1, 0);
  }

  return nextDate;
}

function formatTimeValue(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isValidTimeValue(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function combineDateAndTime(date: Date, time: string) {
  if (!isValidTimeValue(time)) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  const scheduledAt = new Date(date);
  scheduledAt.setHours(hours, minutes, 0, 0);

  return scheduledAt;
}

function adjustTimeValue(time: string, minutesToAdd: number) {
  const baseDate = new Date();
  const scheduledAt = combineDateAndTime(baseDate, time) ?? baseDate;
  scheduledAt.setMinutes(scheduledAt.getMinutes() + minutesToAdd);

  return formatTimeValue(scheduledAt);
}

const preferredTimeOptions = ["09:00", "12:00"];

export function SchedulePostModal({
  children,
  post,
  model,
  clientDraftKey,
  id,
  updatedAt,
  platform,
  onSuccess,
}: SchedulePostModalProps) {
  const [open, setOpen] = useState(false);
  const [initialScheduleDate] = useState(() => getNextScheduleDate());
  const [date, setDate] = useState<Date | undefined>(initialScheduleDate);
  const [time, setTime] = useState(() => formatTimeValue(initialScheduleDate));
  const [isCustomTime, setIsCustomTime] = useState(false);
  const queryClient = useQueryClient();
  const scheduledAt = date ? combineDateAndTime(date, time) : null;
  const selectedTimeIsPast = Boolean(scheduledAt && scheduledAt <= new Date());
  const scheduleSummary = scheduledAt
    ? `${format(scheduledAt, "MMM d")} at ${format(scheduledAt, "p")}`
    : "Select a time";
  const quickTimeOptions = [
    {
      label: "Next",
      value: formatTimeValue(getNextScheduleDate()),
    },
    ...preferredTimeOptions.map((value) => ({
      label: format(
        combineDateAndTime(date ?? new Date(), value) ?? new Date(),
        "p",
      ),
      value,
    })),
  ].filter(
    (option, index, options) =>
      options.findIndex((item) => item.value === option.value) === index,
  );

  function handleDateSelect(selectedDate: Date | undefined) {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    const nextScheduleDate = getNextScheduleDate();
    const selectedScheduleDate = combineDateAndTime(selectedDate, time);

    if (
      isSameDay(selectedDate, nextScheduleDate) &&
      selectedScheduleDate &&
      selectedScheduleDate <= new Date()
    ) {
      setTime(formatTimeValue(nextScheduleDate));
    }

    setDate(selectedDate);
  }

  function handleTimeSelect(selectedTime: string) {
    setTime(selectedTime);
    setIsCustomTime(false);
  }

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!date) throw new Error("Please select a date");
      if (!scheduledAt || scheduledAt <= new Date()) {
        throw new Error("Choose a future time before scheduling.");
      }

      const payload: SchedulePostPayload = {
        id,
        updatedAt,
        clientDraftKey,
        post,
        model,
        scheduledAt: scheduledAt.toISOString(),
        platform,
      };

      return schedulePost(payload);
    },
    onSuccess: (data) => {
      const platformLabel =
        platform === "linkedin" ? "LinkedIn" : platform === "x" ? "X" : "Post";

      toast.success(`${platformLabel} scheduled successfully!`, {
        action: {
          label: "View Calendar",
          onClick: () => {
            window.location.href = "/dashboard/calendar";
          },
        },
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts-calendar"] });
      onSuccess?.({ ...data, platform });
    },
    onError: (error) => {
      console.error("Failed to schedule post:", error);
      const classified = classifyApiError(error);
      toast.error(classified.message);

      if (classified.shouldRedirect) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-3 sm:max-w-[410px]">
        <DialogHeader>
          <DialogTitle>
            Schedule{" "}
            {platform === "linkedin"
              ? "LinkedIn"
              : platform === "x"
                ? "X"
                : "Post"}
          </DialogTitle>
          <DialogDescription>Pick a publish time.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Date</span>
            {date ? (
              <span className="text-sm text-muted-foreground">
                {format(date, "EEE, MMM d")}
              </span>
            ) : null}
          </div>

          <div className="rounded-md border p-2">
            <Calendar
              mode="single"
              fixedWeeks
              selected={date}
              onSelect={handleDateSelect}
              className="mx-auto p-0"
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="schedule-custom-time"
              className="text-sm font-medium"
            >
              Time
            </label>
            <span className="text-sm text-muted-foreground">
              {scheduledAt ? format(scheduledAt, "p") : "Pick a time"}
            </span>
          </div>

          {isCustomTime ? (
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-1.5 rounded-xl border bg-muted/30 p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg border border-transparent text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Move time back 30 minutes"
                onClick={() =>
                  setTime((currentTime) => adjustTimeValue(currentTime, -30))
                }
              >
                <Minus />
              </Button>
              <div
                id="schedule-custom-time"
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-sm font-semibold shadow-sm",
                  selectedTimeIsPast && "border-destructive",
                )}
                aria-invalid={selectedTimeIsPast}
                aria-describedby="schedule-time-error schedule-summary"
              >
                {scheduledAt ? format(scheduledAt, "p") : "Select time"}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg border border-transparent text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Move time forward 30 minutes"
                onClick={() =>
                  setTime((currentTime) => adjustTimeValue(currentTime, 30))
                }
              >
                <Plus />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-lg border border-transparent px-3 text-sm font-semibold text-muted-foreground hover:bg-background hover:text-foreground"
                onClick={() => setIsCustomTime(false)}
              >
                Presets
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 rounded-xl border bg-muted/30 p-1.5">
              {quickTimeOptions.map((option) => {
                const optionIsSelected = time === option.value;
                const optionDate = date
                  ? combineDateAndTime(date, option.value)
                  : null;
                const optionIsPast = Boolean(
                  optionDate && optionDate <= new Date(),
                );

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-9 rounded-lg border border-transparent px-2 text-sm font-semibold text-muted-foreground hover:bg-background hover:text-foreground",
                      optionIsSelected &&
                        "border-border bg-background text-foreground shadow-sm hover:bg-background",
                    )}
                    aria-pressed={optionIsSelected}
                    disabled={optionIsPast}
                    onClick={() => handleTimeSelect(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                  </Button>
                );
              })}
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-lg border border-transparent px-2 text-sm font-semibold text-muted-foreground hover:bg-background hover:text-foreground"
                aria-pressed={isCustomTime}
                onClick={() => setIsCustomTime(true)}
              >
                Custom
              </Button>
            </div>
          )}

          {selectedTimeIsPast ? (
            <p id="schedule-time-error" className="text-sm text-destructive">
              Choose a future time before scheduling.
            </p>
          ) : null}
        </div>

        <DialogFooter className="block">
          <div className="flex items-center gap-3">
            <p
              id="schedule-summary"
              className="min-w-0 flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="block truncate font-medium">
                {scheduleSummary}
              </span>
            </p>
            <Button
              type="submit"
              className="shrink-0 font-semibold"
              onClick={() => scheduleMutation.mutate()}
              disabled={
                scheduleMutation.isPending || !date || selectedTimeIsPast
              }
            >
              {scheduleMutation.isPending ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
