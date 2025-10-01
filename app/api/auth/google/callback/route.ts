import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import argon2 from "argon2";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  if (!data.email)
    return NextResponse.json({ error: "No email" }, { status: 400 });

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || "",
        passwordHash: await argon2.hash(Math.random().toString(36)),
        verified: true,
      },
    });
  }

  // Create JWT
  const jwt = await new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  // Set HttpOnly cookie
  const response = NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/dashboard`,
  );
  response.cookies.set({
    name: "jwt",
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  return response;
}
