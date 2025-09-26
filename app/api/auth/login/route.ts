import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/auth";
import { signToken } from "@/lib/auth/jwt";
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

    const isValid = await verifyPassword(user.passwordHash, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "invalid credentials" },
        { status: 401 },
      );
    }

    const token = signToken({ id: user.id, email: user.email });

    return NextResponse.json({ user, token });
  } catch (_err) {
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
