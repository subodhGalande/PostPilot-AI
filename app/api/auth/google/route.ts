import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getBaseUrl } from "@/lib/auth/base-url";

export async function GET() {
  const baseUrl = getBaseUrl();
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/google/callback`,
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });

  return NextResponse.redirect(url);
}
