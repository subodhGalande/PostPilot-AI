import { NextResponse } from "next/server";
import { verifyPassword, signToken } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "invalid credentials" },
        { status: 201 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { message: "user not verified" },
        { status: 201 }
      );
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      return NextResponse.json(
        { message: "invalid credentials" },
        { status: 201 }
      );
    }

    const token = await signToken({
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
