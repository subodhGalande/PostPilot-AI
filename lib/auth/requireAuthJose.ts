// lib/auth/requireAuthJose.ts
import { cookies } from "next/headers";
import { verifyTokenJose } from "./jwtjose";
import prisma from "@/lib/prisma";

export async function requireAuthJose() {
  const token = (await cookies()).get("jwt")?.value;

  if (!token) return null;

  const payload = await verifyTokenJose(token);
  if (!payload) return null;
  if (!payload.id) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;
  if (user.tokenVersion !== (payload.tokenVersion ?? -1)) return null;

  return payload;
}
