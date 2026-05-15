import { NextResponse } from "next/server";

import { requireAuthJose } from "@/lib/auth/auth";
import { draftStore } from "@/lib/server/draft-store";

export async function GET(req: Request) {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fetchType =
    (searchParams.get("fetch") as "drafts" | "scheduled") || "drafts";

  const posts = await draftStore.listDrafts(authUser.id, fetchType);

  return NextResponse.json(posts);
}
