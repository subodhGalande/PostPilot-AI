import { type NextRequest, NextResponse } from "next/server";
import { requireAuthJose } from "@/lib/auth/auth";
import { draftStore } from "@/lib/server/draft-store";

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuthJose();
    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fetchType =
      searchParams.get("fetch") === "scheduled" ? "scheduled" : "drafts";

    const drafts = await draftStore.listDrafts(authUser.id, fetchType);

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
