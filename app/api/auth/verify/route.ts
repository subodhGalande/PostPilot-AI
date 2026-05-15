import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  //read jwt token from query
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "missing token" }, { status: 401 });
    }

    //check if token is valid
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "invalid or expired token" },
        { status: 401 }
      );
    }
    // Check expiration
    if (tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    //create verified user in user table
    const user = await prisma.user.create({
      data: {
        email: tokenRecord.email,
        name: tokenRecord.name,
        passwordHash: tokenRecord.passwordHash,
        provider: "CREDENTIALS",
        verified: true,
      },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(new URL("/verified", req.url));
  } catch (_err) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
