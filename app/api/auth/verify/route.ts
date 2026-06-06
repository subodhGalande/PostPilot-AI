import { NextResponse } from "next/server";
import { verifyTokenJose } from "@/lib/auth/jwtjose";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/verify-error", req.url));
    }

    const payload = await verifyTokenJose(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/verify-error", req.url));
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.redirect(new URL("/verify-error", req.url));
    }

    if (tokenRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/verify-error", req.url));
    }

    await prisma.user.create({
      data: {
        email: tokenRecord.email,
        name: tokenRecord.name,
        passwordHash: tokenRecord.passwordHash,
        provider: "CREDENTIALS",
        verified: true,
      },
    });

    await prisma.verificationToken.delete({ where: { token } });

    await prisma.verificationToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return NextResponse.redirect(new URL("/verified", req.url));
  } catch (_err) {
    return NextResponse.redirect(new URL("/verify-error", req.url));
  }
}
