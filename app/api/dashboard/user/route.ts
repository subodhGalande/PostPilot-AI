import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose } from "@/lib/auth/auth";

export async function GET() {
  try {
    const authUser = await requireAuthJose();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        accountName: true,
        industry: true,
        accountType: true,
        description: true,
        avatarUrl: true,
        avatarFileKey: true,
        onboarded: true,
        provider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching user", error },
      { status: 400 },
    );
  }
}
