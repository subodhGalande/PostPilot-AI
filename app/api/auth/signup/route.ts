import { hashPassword, signToken } from "@/lib/auth/auth";
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

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: "user already exists" });
    }

    const passwordHash = await hashPassword(password);

    const token = await signToken({ email, name });
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

    return NextResponse.json(
      { message: "verification email sent" },
      { status: 200 }
    );
  } catch (_err) {
    console.error("signup error: ", _err);
    return NextResponse.json({ error: "signup failed", _err }, { status: 500 });
  }
}