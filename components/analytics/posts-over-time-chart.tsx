"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VolumeDataPoint } from "@/lib/analytics/types";

const numberFormat = new Intl.NumberFormat();

interface PostsOverTimeChartProps {
  data: VolumeDataPoint[];
  loading?: boolean;
}

export function PostsOverTimeChart({ data, loading }: PostsOverTimeChartProps) {
  if (loading) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] shimmer-effect rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (
    data.length === 0 ||
    data.every((d) => d.linkedinCount === 0 && d.xCount === 0)
  ) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No activity in this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Posts Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(val: string) => {
                  const parts = val.split("-");
                  return `${parts[2]}/${parts[1]}`;
                }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={(val: unknown) => {
                  const parts = String(val).split("-");
                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }}
                formatter={(value: unknown) =>
                  typeof value === "number"
                    ? numberFormat.format(value)
                    : String(value)
                }
              />
              <Bar
                dataKey="linkedinCount"
                stackId="a"
                fill="var(--chart-1)"
                name="LinkedIn"
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="xCount"
                stackId="a"
                fill="var(--chart-5)"
                name="X"
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
              <Legend verticalAlign="bottom" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
