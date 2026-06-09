import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/analytics/types";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const options: { label: string; value: DateRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1 bg-background">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 text-sm font-medium h-11",
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
