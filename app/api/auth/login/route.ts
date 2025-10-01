import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/auth";
import { signTokenJose } from "@/lib/auth/jwtjose";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { message: "user not verified" },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signTokenJose({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({ message: "login successful" });
    response.cookies.set({
      name: "jwt",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
