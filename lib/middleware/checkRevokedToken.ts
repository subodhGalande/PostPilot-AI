import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenJose } from "../auth/jwtjose";

export async function checkRevokedToken(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 },
      );
    }

    const revoked = await prisma.revokedToken.findUnique({ where: { token } });
    if (revoked) {
      return NextResponse.json(
        { error: "Token has been revoked" },
        { status: 401 },
      );
    }

    const payload = await verifyTokenJose(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return { user: payload, token };
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
