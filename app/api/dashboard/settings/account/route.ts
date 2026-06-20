import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose } from "@/lib/auth/auth";

export async function DELETE() {
  try {
    const authUser = await requireAuthJose();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.post.deleteMany({ where: { userId: authUser.id } }),
      prisma.user.delete({ where: { id: authUser.id } }),
    ]);

    const response = NextResponse.json({ message: "Account deleted" });

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
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting account", error },
      { status: 400 },
    );
  }
}
