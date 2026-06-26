"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformMixItem } from "@/lib/analytics/types";

const COLORS: Record<string, string> = {
  LinkedIn: "var(--chart-1)",
  X: "var(--chart-3)",
};

const numberFormat = new Intl.NumberFormat();

interface PlatformDonutChartProps {
  data: PlatformMixItem[];
  loading?: boolean;
}

export function PlatformDonutChart({ data, loading }: PlatformDonutChartProps) {
  if (loading) {
    return (
      <Card className="flex-1 overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-sm dark:bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Platform Mix
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
      <Card className="flex-1 overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-sm dark:bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Platform Mix
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

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="flex-1 overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-sm dark:bg-card/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Platform Mix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative chart-container h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="count"
                  nameKey="platform"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.platform}
                      fill={COLORS[entry.platform] ?? "var(--chart-1)"}
                    />
                  ))}
                </Pie>
                <Tooltip
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
                  formatter={(value: unknown, name: unknown) => {
                    const num = typeof value === "number" ? value : 0;
                    const nameStr = typeof name === "string" ? name : "";
                    return `${nameStr}: ${numberFormat.format(num)} (${Math.round((num / total) * 100)}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center leading-none">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {numberFormat.format(total)}
                </span>
                <span className="text-xs text-muted-foreground">posts</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {data.map((entry) => (
              <div key={entry.platform} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: COLORS[entry.platform] }}
                />
                <span className="text-sm font-medium">{entry.platform}</span>
                <span className="text-sm text-muted-foreground">
                  {entry.count} ({Math.round((entry.count / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
