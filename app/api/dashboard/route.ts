import prisma from "@/lib/prisma";

export async function GET() {
  const _users = await prisma.user.findUnique({
    where: { id: "clh5v1r440000mkn6j3q6v6xv" },
  });
}
