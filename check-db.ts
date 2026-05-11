import { PrismaClient } from './app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('LinkedInPost', 'XPost', 'Post')
  `
  console.log('Tables in database:', tables.map(t => t.table_name))

  const postStatus = await prisma.$queryRaw<{ name: string }[]>`SELECT name FROM pg_type WHERE typname = 'PostStatus'`
  console.log('PostStatus enum values:', postStatus.map(p => p.name))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())