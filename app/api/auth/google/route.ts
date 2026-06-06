import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
);

export async function GET() {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });

  return NextResponse.redirect(url);
}
