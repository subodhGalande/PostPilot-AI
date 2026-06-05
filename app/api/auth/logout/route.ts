import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenJose } from "@/lib/auth/jwtjose";
import prisma from "@/lib/prisma";
import { csrfErrorResponse, validateCsrf } from "@/lib/csrf";

export async function POST(req: Request) {
  if (!validateCsrf(req).valid) return csrfErrorResponse();

  const token = (await cookies()).get("jwt")?.value;
  if (token) {
    const payload = await verifyTokenJose(token);
    if (payload?.id) {
      await prisma.user.update({
        where: { id: payload.id },
        data: { tokenVersion: { increment: 1 } },
      });
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set({
    name: "jwt",
    value: "",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
