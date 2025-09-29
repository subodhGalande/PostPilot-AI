// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRevokedToken } from "@/lib/middleware/checkRevokedToken";

export async function POST(req: Request) {
  const authCheck = await checkRevokedToken(req);

  if ("status" in authCheck || "error" in authCheck) return authCheck;

  const token = authCheck.token;

  try {
    await prisma.revokedToken.create({ data: { token } });

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
