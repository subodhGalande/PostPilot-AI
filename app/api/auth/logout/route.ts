import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "no token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 },
      );
    }

    const decodeToken = verifyToken(token);
    if (!decodeToken) {
      return NextResponse.json(
        { error: "invalid or expired token" },
        { status: 401 },
      );
    }

    //save to revokedToken/blacklist
    await prisma.RevokedToken.create({
      data: {
        token,
      },
    });

    return NextResponse.json(
      { message: "logged out successfully" },
      { status: 200 },
    );
  } catch (_err) {
    console.error("logout error: ", _err);
    return NextResponse.json({ error: "logout failed" }, { status: 500 });
  }
}
