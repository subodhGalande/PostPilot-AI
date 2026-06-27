"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStage } from "@/lib/analytics/types";

const numberFormat = new Intl.NumberFormat();

interface PipelineFunnelChartProps {
  data: FunnelStage[];
  loading?: boolean;
}

export function PipelineFunnelChart({
  data,
  loading,
}: PipelineFunnelChartProps) {
  if (loading) {
    return (
      <Card className="flex-1 overflow-hidden border-border/50 bg-card shadow-sm dark:bg-white/5 dark:backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] shimmer-effect rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="flex-1 overflow-hidden border-border/50 bg-card shadow-sm dark:bg-white/5 dark:backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  const scheduledCount = data.find((d) => d.stage === "Scheduled")?.count ?? 0;
  const createdCount = data.find((d) => d.stage === "Created")?.count ?? 0;
  const retentionRate =
    createdCount > 0 ? Math.round((scheduledCount / createdCount) * 100) : 0;

  return (
    <Card className="flex-1 overflow-hidden border-border/50 bg-card shadow-sm dark:bg-white/5 dark:backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Pipeline Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <pattern
                  id="diagonal-stripe"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <rect width="6" height="6" fill="var(--chart-2)" />
                  <line
                    x1="0"
                    y1="6"
                    x2="6"
                    y2="0"
                    stroke="var(--chart-2)"
                    strokeWidth="3"
                    strokeOpacity="0.5"
                  />
                </pattern>
                <pattern
                  id="diagonal-stripe-light"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <rect
                    width="6"
                    height="6"
                    fill="var(--chart-2)"
                    fillOpacity="0.4"
                  />
                  <line
                    x1="0"
                    y1="6"
                    x2="6"
                    y2="0"
                    stroke="var(--chart-2)"
                    strokeWidth="3"
                    strokeOpacity="0.3"
                  />
                </pattern>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                strokeOpacity={0.4}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--foreground)",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  color: "var(--foreground)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                labelStyle={{
                  color: "var(--muted-foreground)",
                  fontSize: "12px",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
                formatter={(value: unknown) => {
                  const count = typeof value === "number" ? value : 0;
                  return `${numberFormat.format(count)} posts`;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={40}>
                {data.map((entry, index) => {
                  const isScheduled = entry.stage === "Scheduled";
                  const opacity =
                    index === 0
                      ? 1
                      : scheduledCount > 0
                        ? scheduledCount / createdCount
                        : 0;
                  return (
                    <Cell
                      key={entry.stage}
                      fill={
                        isScheduled ? "url(#diagonal-stripe)" : "var(--chart-1)"
                      }
                      fillOpacity={
                        isScheduled ? Math.max(opacity, 0.3) : opacity
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {retentionRate}% of created posts get scheduled
        </p>
      </CardContent>
    </Card>
  );
}
