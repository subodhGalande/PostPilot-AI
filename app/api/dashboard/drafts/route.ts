import { NextResponse } from "next/server";
import { requireAuthJose } from "@/lib/auth/auth";
import { draftStore } from "@/lib/server/draft-store";

export async function GET() {
  try {
    const authUser = await requireAuthJose();
    if (!authUser || !authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await draftStore.listDrafts(authUser.id, "drafts");

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
