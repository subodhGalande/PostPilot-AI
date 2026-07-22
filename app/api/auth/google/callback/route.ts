import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { signTokenJose } from "@/lib/auth/jwtjose";
import { getBaseUrl } from "@/lib/auth/base-url";
import argon2 from "argon2";

export async function GET(req: Request) {
  const baseUrl = getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const errorRedirect = `${baseUrl}/login?error=google_auth_failed`;

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=missing_code`,
      );
    }

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=no_email`,
      );
    }

    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || "",
          passwordHash: await argon2.hash(Math.random().toString(36)),
          verified: true,
          provider: "GOOGLE",
        },
      });
    } else if (!user.name && data.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name },
      });
    }

    const jwt = await signTokenJose({
      id: user.id,
      name: user.name || "",
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.redirect(
      `${baseUrl}/dashboard`,
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
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(errorRedirect);
  }
}
