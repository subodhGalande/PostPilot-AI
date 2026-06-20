"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  CalendarCheck,
  TrendingUp,
  Flame,
  AlertCircle,
} from "lucide-react";

import { KpiCard } from "@/components/analytics/kpi-card";
import { PlatformDonutChart } from "@/components/analytics/platform-donut-chart";
import { PipelineFunnelChart } from "@/components/analytics/pipeline-funnel-chart";
import { PostsOverTimeChart } from "@/components/analytics/posts-over-time-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AnalyticsResponse, DateRange } from "@/lib/analytics/types";

const numberFormat = new Intl.NumberFormat();

function formatStreak(value: number): string {
  return value > 0 ? `${value} day${value === 1 ? "" : "s"}` : "—";
}

function formatPercentage(value: number): string {
  return `${value}%`;
}

export function AnalyticsContent({
  initialData,
  initialRange = "30d",
}: {
  initialData: AnalyticsResponse | null;
  initialRange?: DateRange;
}) {
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") as DateRange) ?? initialRange;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/analytics?range=${range}`);
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return res.json() as Promise<AnalyticsResponse>;
    },
    initialData: range === initialRange ? initialData : undefined,
  });

  const kpis = data?.kpis;

  return (
    <div className="flex flex-1 flex-col gap-6 bg-slate-50/50 p-4 dark:bg-transparent md:p-6">
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>
              {(error as Error)?.message ?? "Failed to load analytics"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-auto"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        <KpiCard
          label="Posts Created"
          value={kpis ? numberFormat.format(kpis.totalPosts) : "—"}
          icon={FileText}
          loading={isLoading}
          change={kpis?.totalPostsChange}
        />
        <KpiCard
          label="Scheduled"
          value={kpis ? numberFormat.format(kpis.scheduledPosts) : "—"}
          icon={CalendarCheck}
          loading={isLoading}
          change={kpis?.scheduledPostsChange}
        />
        <KpiCard
          label="Conversion Rate"
          value={kpis ? formatPercentage(kpis.conversionRate) : "—"}
          icon={TrendingUp}
          loading={isLoading}
          description="Posts that made it to schedule"
          change={kpis?.conversionRateChange}
        />
        <KpiCard
          label="Streak"
          value={kpis ? formatStreak(kpis.streak) : "—"}
          icon={Flame}
          loading={isLoading}
          description="Consecutive days with activity"
          change={kpis?.streakChange}
        />
      </div>

      <PostsOverTimeChart data={data?.volume ?? []} loading={isLoading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PlatformDonutChart
          data={data?.platformMix ?? []}
          loading={isLoading}
        />
        <PipelineFunnelChart data={data?.funnel ?? []} loading={isLoading} />
      </div>
    </div>
  );
}
