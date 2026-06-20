import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose } from "@/lib/auth/auth";

export async function PATCH(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, accountName, industry, accountType, description } =
      await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name,
        accountName,
        industry,
        accountType: accountType.toUpperCase(),
        description,
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountName: true,
        industry: true,
        accountType: true,
        description: true,
        provider: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating profile", error },
      { status: 400 },
    );
  }
}
