import { redirect } from "next/navigation";

import { requireAuthJose } from "@/lib/auth/auth";
import { getAnalyticsResponse } from "@/lib/analytics/queries";
import { AnalyticsContent } from "@/components/analytics/analytics-content";
import type { DateRange } from "@/lib/analytics/types";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  const { range } = await searchParams;
  const rangeParam: DateRange =
    range === "7d" || range === "30d" || range === "90d" ? range : "30d";

  const initialData = await getAnalyticsResponse(authUser.id, rangeParam).catch(
    () => null,
  );

  return (
    <AnalyticsContent initialData={initialData} initialRange={rangeParam} />
  );
}
