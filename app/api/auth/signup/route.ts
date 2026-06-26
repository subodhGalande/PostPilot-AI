import { hashPassword } from "@/lib/auth/auth";
import { signTokenJose } from "@/lib/auth/jwtjose";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { csrfErrorResponse, validateCsrf } from "@/lib/csrf";
import aj from "@/lib/arcjet";
import { protectSignup } from "@arcjet/next";

const protect = aj.withRule(
  protectSignup({
    email: {
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    },
    bots: {
      mode: "LIVE",
      allow: [],
    },
    rateLimit: {
      mode: "LIVE",
      interval: "15m",
      max: 3,
    },
  }),
);

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

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }
    const { email, name, password } = parsed.data;

    const decision = await protect.protect(req, { email });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { message: "Too many requests" },
          { status: 429 },
        );
      } else if (decision.reason.isEmail()) {
        return NextResponse.json(
          { message: "Invalid email address" },
          { status: 400 },
        );
      } else {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

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

    await transporter.sendMail({
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

    return NextResponse.json(
      { message: "verification email sent" },
      { status: 200 },
    );
  } catch (_err) {
    console.error("signup error: ", _err);
    return NextResponse.json({ error: "signup failed", _err }, { status: 500 });
  }
}
