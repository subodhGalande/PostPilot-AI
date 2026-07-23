import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  checkRateLimit,
  rateLimitExceededResponse,
  buildRateLimitHeaders,
} from "@/lib/internal-rate-limit";

const DESTINATION_EMAIL = "subodh.temp@protonmail.com";

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
  // Internal rate limit check per IP (max 5 submissions per minute)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`contact-form:${ip}`, {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetTime);
  }

  try {
    const body = await req.json();
    const { name, email, topic, subject, message } = body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        {
          status: 400,
          headers: buildRateLimitHeaders(
            5,
            rateLimit.remaining,
            rateLimit.resetTime,
          ),
        },
      );
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        {
          status: 400,
          headers: buildRateLimitHeaders(
            5,
            rateLimit.remaining,
            rateLimit.resetTime,
          ),
        },
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const cleanTopic = topic || "General Query";

    const emailSubject = `[PostPilot-AI] ${cleanSubject}`;

    // Plain text content
    const textContent = `
New Contact Form Submission on PostPilot AI

From: ${cleanName} (${cleanEmail})
Topic: ${cleanTopic}
Subject: ${cleanSubject}
Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC

Message:
--------------------------------------------------
${cleanMessage}
--------------------------------------------------

Reply directly to this email to respond to ${cleanName}.
`.trim();

    // High-craft HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    
    <!-- Header -->
    <div style="border-b: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-family: monospace; font-size: 12px; color: #0047ff; text-transform: uppercase; tracking-caps: 1px; font-weight: 600;">
        PostPilot AI // Support & Feedback
      </span>
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 8px 0 0 0;">
        ${emailSubject}
      </h2>
    </div>

    <!-- Sender Details -->
    <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #71717a; width: 100px; font-weight: 500;">From:</td>
          <td style="padding: 4px 0; color: #fafafa; font-weight: 600;">${cleanName} (&lt;${cleanEmail}&gt;)</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #71717a; font-weight: 500;">Topic:</td>
          <td style="padding: 4px 0; color: #0047ff; font-weight: 600;">${cleanTopic}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #71717a; font-weight: 500;">Sent at:</td>
          <td style="padding: 4px 0; color: #71717a; font-size: 13px;">${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC</td>
        </tr>
      </table>
    </div>

    <!-- Message Body -->
    <div style="margin-bottom: 28px;">
      <h3 style="font-size: 12px; font-family: monospace; text-transform: uppercase; color: #71717a; margin-bottom: 8px;">Message Content</h3>
      <div style="background-color: #09090b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; color: #e4e4e7; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${cleanMessage}
      </div>
    </div>

    <!-- Footer -->
    <div style="border-t: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-size: 12px; color: #71717a; text-align: center;">
      Replying to this notification will directly email <a href="mailto:${cleanEmail}" style="color: #0047ff; text-decoration: none;">${cleanEmail}</a>.
    </div>

  </div>
</body>
</html>
`.trim();

    // Send email using Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"${cleanName} via PostPilot AI" <${process.env.SMTP_VERIFIED_SENDER_MAIL || process.env.SMTP_USER}>`,
        to: DESTINATION_EMAIL,
        replyTo: cleanEmail,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });
      console.log(
        `[Contact Form Email Sent] Sent to ${DESTINATION_EMAIL} from ${cleanEmail}`,
      );
    } else {
      console.log(
        `[Contact Form Simulated] SMTP credentials not set. Message logged:\n`,
        textContent,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for reaching out! Your message has been sent directly to our team.",
      },
      {
        status: 200,
        headers: buildRateLimitHeaders(
          5,
          rateLimit.remaining,
          rateLimit.resetTime,
        ),
      },
    );
  } catch (error) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json(
      { error: "Failed to send email message. Please try again later." },
      {
        status: 500,
        headers: buildRateLimitHeaders(
          5,
          rateLimit.remaining,
          rateLimit.resetTime,
        ),
      },
    );
  }
}
