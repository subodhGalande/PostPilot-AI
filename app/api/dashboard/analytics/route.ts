import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";
import {
  databaseConnectionErrorResponse,
  isDatabaseConnectionError,
} from "@/lib/server/database-errors";
import { getAnalyticsResponse } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/types";

export async function GET(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") ?? "30d";

    if (!["7d", "30d", "90d"].includes(rangeParam)) {
      return NextResponse.json(
        { error: "Invalid range. Use 7d, 30d, or 90d." },
        { status: 400 },
      );
    }

    const range = rangeParam as DateRange;
    const data = await getAnalyticsResponse(authUser.id, range);

    return NextResponse.json(data);
  } catch (error) {
    console.error("analytics GET route error", error);

    if (isDatabaseConnectionError(error)) {
      return databaseConnectionErrorResponse();
    }

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
