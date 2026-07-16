import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = "subodhgcool1@gmail.com";
  
  console.log(`Reverting seed data for user: ${targetEmail}`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    console.log("User not found, nothing to revert.");
    return;
  }

  // Clear posts (cascades to LinkedInPost and XPost)
  console.log("Deleting posts...");
  await prisma.post.deleteMany({
    where: { userId: user.id }
  });

  // Clear token transactions
  console.log("Deleting token transactions...");
  await prisma.tokenTransaction.deleteMany({
    where: { userId: user.id }
  });

  // Reset profile to defaults
  console.log("Resetting profile...");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "",
      accountName: null,
      description: null,
      industry: null,
      avatarUrl: null,
      onboarded: false
    }
  });

  console.log("✅ Seed reverted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
