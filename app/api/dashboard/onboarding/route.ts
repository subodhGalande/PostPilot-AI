import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose } from "@/lib/auth/auth";

export async function PATCH(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountType, industry, accountName, description } =
      await req.json();
    const toUpperCaseAccountType = accountType.toUpperCase();

    const updatedUser = await prisma.user.update({
      where: {
        id: authUser.id,
      },
      data: {
        accountType: toUpperCaseAccountType,
        industry,
        accountName,
        description,
        onboarded: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "error updating onboarding data", error },
      { status: 400 },
    );
  }
}
