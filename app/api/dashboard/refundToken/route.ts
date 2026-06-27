import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";
import { tokenLedger, RefundRateLimitError } from "@/lib/server/token-ledger";

export async function POST() {
  try {
    const authUser = await requireAuthJose();

    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await tokenLedger.refundToken(authUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RefundRateLimitError) {
      return NextResponse.json(
        { error: "Too many refund attempts" },
        { status: 429 },
      );
    }

    console.error("Refund token error:", error);
    return NextResponse.json(
      { error: "Failed to refund token" },
      { status: 500 },
    );
  }
}
