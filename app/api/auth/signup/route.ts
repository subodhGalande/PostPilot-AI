import { hashPassword } from "@/lib/auth/auth";
import { signTokenJose } from "@/lib/auth/jwtjose";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

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
    const { email, name, password } = await req.json();
    // Basic request validation and helpful logs; avoid logging secrets
    console.info("signup request received", { email, name });

    if (!email || !name || !password) {
      console.warn("signup validation failed: missing fields", { email, name });
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 }
      );
    }

    // simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("signup validation failed: invalid email", { email });
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    // Runtime check for JWT secret so error is clear when signing tokens
    if (!process.env.JWT_SECRET) {
      console.error("signup error: JWT_SECRET not set");
      return NextResponse.json(
        { error: "server misconfiguration: JWT_SECRET not set" },
        { status: 500 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: "user already exists" });
    }

    const passwordHash = await hashPassword(password);

    let token: string;
    try {
      token = await signTokenJose({ email, name });
    } catch (err) {
      console.error("signup error: token signing failed", err);
      return NextResponse.json(
        { error: "token generation failed" },
        { status: 500 }
      );
    }
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const verification = await prisma.verificationToken.create({
      data: {
        email,
        name,
        passwordHash,
        token,
        expiresAt,
      },
    });
    console.info("verification token created", { id: verification.id, email });

    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

    // Check SMTP and APP_URL envs before attempting to send
    const missingMailEnv = [] as string[];
    if (!process.env.SMTP_USER) missingMailEnv.push("SMTP_USER");
    if (!process.env.SMTP_PASS) missingMailEnv.push("SMTP_PASS");
    if (!process.env.SMTP_VERIFIED_SENDER_MAIL)
      missingMailEnv.push("SMTP_VERIFIED_SENDER_MAIL");
    if (!process.env.APP_URL) missingMailEnv.push("APP_URL");
    if (missingMailEnv.length) {
      console.error("signup error: missing mail/env vars", missingMailEnv);
      return NextResponse.json(
        {
          error: `server misconfiguration: missing envs ${missingMailEnv.join(
            ","
          )}`,
        },
        { status: 500 }
      );
    }

    try {
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
      console.info("signup: mail queued", {
        messageId: mail.messageId,
        to: email,
      });
      return NextResponse.json(
        { message: "verification email sent" },
        { status: 200 }
      );
    } catch (mailErr) {
      console.error("signup error: failed to send verification email", mailErr);
      // Do not delete the verification token — return an error so client can retry
      return NextResponse.json(
        { error: "failed to send verification email" },
        { status: 502 }
      );
    }
  } catch (_err) {
    console.error("signup error: ", _err);
    // Keep the response payload minimal to avoid leaking internal errors
    return NextResponse.json({ error: "signup failed" }, { status: 500 });
  }
}
