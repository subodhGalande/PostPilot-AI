import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/auth";
import { signTokenJose } from "@/lib/auth/jwtjose";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { csrfErrorResponse, validateCsrf } from "@/lib/csrf";
import aj from "@/lib/arcjet";
import { detectBot, slidingWindow } from "@arcjet/next";

const protect = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [], // blocks all automated clients
    }),
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "15m",
      max: 10,
    }),
  );

export async function POST(req: Request) {
  try {
    if (!validateCsrf(req).valid) return csrfErrorResponse();

    const decision = await protect.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { message: "Too many requests" },
          { status: 429 },
        );
      } else {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { message: "user not verified" },
        { status: 400 },
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const retryAfter = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000,
      );
      return NextResponse.json(
        { message: "account locked" },
        { status: 423, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      const updateData: Record<string, unknown> = {
        failedLoginAttempts: { increment: 1 },
      };
      if (user.failedLoginAttempts + 1 >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });
      return NextResponse.json(
        { message: "invalid credentials" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = await signTokenJose({
      id: user.id,
      name: user.name,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({ message: "login successful" });
    response.cookies.set({
      name: "jwt",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
