import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  change?: number;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  description,
  loading,
  change,
}: KpiCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const showChange = change !== undefined && !loading;

  return (
    <Card className="group flex-1 min-w-[180px] h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:bg-card/40 hover:bg-card/80 dark:hover:bg-card/60">
      <CardContent className="flex flex-col justify-between h-full px-5 py-3.5 relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/10 dark:group-hover:bg-primary/20">
            <Icon className={cn("size-4", loading && "animate-pulse")} />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          {loading ? (
            <div className="h-8 w-24 shimmer-effect rounded-md" />
          ) : (
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            {showChange && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  isPositive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(change)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
