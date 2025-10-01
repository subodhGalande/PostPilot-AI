import { NextResponse } from "next/server";
import { requireAuthJose } from "@/lib/middleware/requireAuthJose"; // your middleware

export async function GET() {
  const authResult = await requireAuthJose();

  if ("user" in authResult) {
    return NextResponse.json({
      message: "You are authenticated!",
      user: authResult.user,
    });
  }

  // middleware already returns 401 if unauthorized
  return authResult;
}
