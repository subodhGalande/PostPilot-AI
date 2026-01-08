import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const users = await prisma.user.findUnique({
    where: { id: "clh5v1r440000mkn6j3q6v6xv" },
  });
}
