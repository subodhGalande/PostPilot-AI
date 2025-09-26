import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/auth";
import { signToken } from "@/lib/auth/jwt";
import nodemailer from "nodemailer";

const smtpVerifiedMail = "subodh.dsgn@gmail.com";

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
    const { email, password, name } = await req.json();

    const passwordHash = await hashPassword(password);

    const token = signToken({ email, name, passwordHash });

    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

    const mail = await transporter.sendMail({
      from: `"PostPilot AI " ${smtpVerifiedMail}`,
      to: email,
      subject: "verify your email - PostPilot AI",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thanks for signing up! Please verify your email by clicking below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return NextResponse.json({ message: "verification email sent", mail });
  } catch (_err) {
    console.error("signup error: ", _err);
    return NextResponse.json({ error: "signup failed", _err }, { status: 500 });
  }
}
