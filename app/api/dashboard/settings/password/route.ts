import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose, verifyPassword, hashPassword } from "@/lib/auth/auth";
import aj from "@/lib/arcjet";
import { slidingWindow } from "@arcjet/next";

const protect = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "15m",
    max: 5,
  }),
);

export async function PATCH(req: Request) {
  try {
    const decision = await protect.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { message: "Too many requests. Try again later." },
          { status: 429 },
        );
      }
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const authUser = await requireAuthJose();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        passwordHash: true,
        provider: true,
        lockedUntil: true,
        failedLoginAttempts: true,
      },
    });

    if (!user || user.provider !== "CREDENTIALS" || !user.passwordHash) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const retryAfter = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000,
      );
      return NextResponse.json(
        { message: "Account temporarily locked. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const { currentPassword, newPassword } = await req.json();

    const isValid = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      const updateData: Record<string, unknown> = {
        failedLoginAttempts: { increment: 1 },
      };
      if (user.failedLoginAttempts + 1 >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });

      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating password", error },
      { status: 400 },
    );
  }
}
