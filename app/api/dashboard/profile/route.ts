import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthJose } from "@/lib/auth/auth";
import { replaceOrphanedFileKey } from "@/lib/profile/avatar";

export async function PATCH(req: Request) {
  try {
    const authUser = await requireAuthJose();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      accountName,
      industry,
      accountType,
      description,
      avatarUrl,
      avatarFileKey,
    } = await req.json();

    const oldFileKey = (await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarFileKey: true },
    }))?.avatarFileKey;

    if (oldFileKey && avatarUrl !== undefined && authUser.id) {
      await replaceOrphanedFileKey(authUser.id, oldFileKey);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(accountName !== undefined && { accountName }),
        ...(industry !== undefined && { industry }),
        ...(accountType !== undefined && { accountType: accountType?.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarFileKey !== undefined && { avatarFileKey }),
      },
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
