import { NextResponse } from "next/server";
import { verifyTokenJose } from "../auth/jwtjose";
import { cookies } from "next/headers";

export async function requireAuthJose() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyTokenJose(token);
  if (!payload)
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );

  return { user: payload };
}
