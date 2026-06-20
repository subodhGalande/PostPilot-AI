import { UTApi } from "uploadthing/server";
import prisma from "@/lib/prisma";

const utapi = new UTApi();

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export function validateAvatarFileType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export function validateAvatarFileSize(size: number): boolean {
  return size <= MAX_SIZE;
}

export async function removeAvatar(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarFileKey: true },
  });

  if (user?.avatarFileKey) {
    await utapi.deleteFiles(user.avatarFileKey);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarFileKey: null },
  });
}

export async function replaceOrphanedFileKey(
  userId: string,
  oldFileKey: string | null | undefined,
): Promise<void> {
  if (!oldFileKey) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarFileKey: true },
  });

  if (user?.avatarFileKey === oldFileKey) {
    await utapi.deleteFiles(oldFileKey);
  }
}
