import prisma from "./lib/prisma";

async function main() {
  const result = await prisma.$queryRaw<{ column_name: string }[]>`SELECT column_name FROM information_schema.columns WHERE table_name = 'Post' ORDER BY ordinal_position`;
  console.log("Post columns:", result.map(r => r.column_name));
}

main();