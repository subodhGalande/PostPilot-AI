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
    <Card className="flex-1 min-w-[180px] h-full">
      <CardContent className="flex flex-col gap-2 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <Icon
            className={cn(
              "size-4 text-muted-foreground",
              loading && "animate-pulse",
            )}
          />
        </div>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-16 shimmer-effect rounded-md" />
          ) : (
            <span className="text-3xl font-bold tracking-tight">{value}</span>
          )}
          {showChange && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
