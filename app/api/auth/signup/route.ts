import { hashPassword } from "@/lib/auth/auth";
import { signTokenJose } from "@/lib/auth/jwtjose";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import {
  buildRateLimitHeaders,
  checkRateLimit,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";
import { csrfErrorResponse, validateCsrf } from "@/lib/csrf";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    if (!validateCsrf(req).valid) return csrfErrorResponse();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const ipLimit = checkRateLimit(`signup:ip:${ip}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.success) {
      return rateLimitExceededResponse(ipLimit.resetTime);
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, name, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: "user already exists" });
    }

    const passwordHash = await hashPassword(password);

    await prisma.verificationToken.deleteMany({
      where: { email, expiresAt: { lt: new Date() } },
    });

    const token = await signTokenJose({ email, name });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.verificationToken.create({
      data: {
        email,
        name,
        passwordHash,
        token,
        expiresAt,
      },
    });

    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

    const mail = await transporter.sendMail({
      from: `"PostPilot AI " ${process.env.SMTP_VERIFIED_SENDER_MAIL}`,
      to: email,
      subject: "verify your email - PostPilot AI",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thanks for signing up! Please verify your email by clicking below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    const successResponse = NextResponse.json(
      { message: "verification email sent" },
      { status: 200 }
    );

    Object.entries(
      buildRateLimitHeaders(3, ipLimit.remaining, ipLimit.resetTime)
    ).forEach(([key, value]) => successResponse.headers.set(key, value));

    return successResponse;
  } catch (_err) {
    console.error("signup error: ", _err);
    return NextResponse.json({ error: "signup failed", _err }, { status: 500 });
  }
}
