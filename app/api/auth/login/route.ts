import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/auth";
import { signToken } from "@/lib/auth/jwt";
import { signTokenJose } from "@/lib/auth/jwtjose";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "invalid credentials" },
        { status: 401 },
      );
    }
    // Check if user has a password hash
    if (!user.passwordHash) {
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

    //return token
    const response = NextResponse.json({ message: "login successful" });
    response.headers.set("Authorization", `Bearer ${token}`);
    console.log(token);

    return response;
  } catch (_err) {
    console.log(_err);
    return NextResponse.json({ error: "login failed", _err }, { status: 500 });
  }
}
