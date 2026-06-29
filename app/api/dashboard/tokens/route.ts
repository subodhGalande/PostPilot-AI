import { NextResponse } from "next/server";
import { requireAuthJose } from "@/lib/auth/auth";
import { tokenLedger } from "@/lib/server/token-ledger";

export async function GET() {
  try {
    const authUser = await requireAuthJose();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // biome-ignore lint/style/noNonNullAssertion: Checked above
    const usage = await tokenLedger.getDailyUsage(authUser.id!);

    return NextResponse.json({
      remaining: usage.remaining,
      used: usage.used,
      total: usage.total,
    });
  } catch (error) {
    console.error("tokens route error", error);
    return NextResponse.json(
      { error: "Failed to fetch token usage" },
      { status: 500 },
    );
  }
}
