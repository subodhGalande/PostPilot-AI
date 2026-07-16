import { PrismaClient, PostStatus, TokenType } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = "subodhgcool1@gmail.com";
  
  console.log(`Seeding database for user: ${targetEmail}`);

  // 1. Find or create the target user
  let user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: targetEmail,
        name: "Alex Rivera",
        accountName: "@alexrivera",
        description: "Design Engineer building the future of AI tools.",
        industry: "Tech / AI",
        onboarded: true,
        verified: true,
        tokenVersion: 1
      }
    });
    console.log(`Created new user: ${user.name}`);
  } else {
    // Update profile for a better UI look
    user = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        name: "Alex Rivera",
        accountName: "@alexrivera",
        description: "Design Engineer building the future of AI tools.",
        industry: "Tech / AI",
        avatarUrl: null,
        onboarded: true
      }
    });
    console.log(`Updated existing user profile: ${user.name}`);
  }

  // Clear existing posts for a clean slate
  console.log("Cleaning up old posts...");
  await prisma.post.deleteMany({
    where: { userId: user.id }
  });
  await prisma.tokenTransaction.deleteMany({
    where: { userId: user.id }
  });

  const now = new Date();
  const generatePastDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 60), 0, 0);
    return d;
  };
  
  const generateFutureDate = (daysAhead: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 60), 0, 0); // 9am - 5pm
    return d;
  };

  // 2. Create Analytics / Historical Data
  console.log("Creating past posts for analytics...");
  const pastPosts = [];
  
  // Create 15 posts over the last 30 days
  for (let i = 1; i <= 15; i++) {
    const daysAgo = Math.floor(Math.random() * 28) + 1; // 1 to 29 days ago
    const createdAt = generatePastDate(daysAgo);
    
    pastPosts.push({
      title: `Historical Post ${i}`,
      topic: "Tech & AI",
      baseIdea: "Looking back at the evolution of generative UI.",
      userId: user.id,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Insert base past posts
  for (const postData of pastPosts) {
    const post = await prisma.post.create({ data: postData });
    // For analytics to count them, they need scheduled posts in the past
    // Randomly assign to LinkedIn, X, or both
    const platformChoice = Math.random();
    
    if (platformChoice > 0.3) {
      await prisma.linkedInPost.create({
        data: {
          postId: post.id,
          content: "Reflecting on how far we've come with AI tools. #tech #ai",
          status: PostStatus.SCHEDULED,
          scheduledAt: post.createdAt,
          createdAt: post.createdAt,
          updatedAt: post.createdAt,
        }
      });
    }
    
    if (platformChoice < 0.7) {
      await prisma.xPost.create({
        data: {
          postId: post.id,
          content: "Reflecting on how far we've come with AI tools. The pace is incredible.",
          status: PostStatus.SCHEDULED,
          scheduledAt: post.createdAt,
          createdAt: post.createdAt,
          updatedAt: post.createdAt,
        }
      });
    }
  }

  // 3. Create Future Calendar Data
  console.log("Creating scheduled posts for calendar...");
  const scheduledContent = [
    {
      title: "Why Developers Hate X",
      topic: "Developer Experience",
      idea: "A deep dive into friction points in modern dev tools.",
      daysAhead: 1,
      li: "Modern development tools have a friction problem. Here's why we need to focus on flow state over feature count.",
      x: "1/ Dev tools are broken. Too much friction, not enough flow. A thread on why we need better DX. 🧵"
    },
    {
      title: "The Future of Generative UI",
      topic: "Design Engineering",
      idea: "Generative UI is changing how we build interfaces.",
      daysAhead: 2,
      li: "Generative UI isn't just a buzzword. It's fundamentally changing how we approach component design. Instead of building static states, we're building dynamic systems that adapt to user intent in real-time.",
      x: "Generative UI is the biggest shift in frontend since React. Are you building for dynamic states or static screens?"
    },
    {
      title: "Bootstrapping in 2026",
      topic: "Startups",
      idea: "The landscape of bootstrapping has shifted.",
      daysAhead: 4,
      li: "Bootstrapping a SaaS today looks very different than it did 5 years ago. The barrier to entry is lower, but the barrier to attention is infinitely higher. Focus on distribution first.",
      x: null // LinkedIn only
    },
    {
      title: "Micro-animations Matter",
      topic: "UI/UX",
      idea: "Small details make a big difference in perception.",
      daysAhead: 5,
      li: null, // X only
      x: "A 100ms spring animation can make your app feel twice as fast. Don't underestimate the power of micro-interactions."
    },
    {
      title: "Building PostPilot",
      topic: "Build in Public",
      idea: "Behind the scenes of our launch.",
      daysAhead: 6,
      li: "Building an AI-native app requires rethinking the standard CRUD interface. Here is how we designed PostPilot to feel like magic.",
      x: "Building an AI-native app requires rethinking standard interfaces. A quick look at the PostPilot architecture."
    }
  ];

  for (let i = 0; i < scheduledContent.length; i++) {
    const content = scheduledContent[i];
    const createdAt = new Date();
    const scheduledAt = generateFutureDate(content.daysAhead);
    
    const post = await prisma.post.create({
      data: {
        title: content.title,
        topic: content.topic,
        baseIdea: content.idea,
        userId: user.id,
        createdAt,
        updatedAt: createdAt,
        clientDraftKey: `seed-sched-${i}`
      }
    });

    if (content.li) {
      await prisma.linkedInPost.create({
        data: {
          postId: post.id,
          content: content.li,
          status: PostStatus.SCHEDULED,
          scheduledAt
        }
      });
    }

    if (content.x) {
      await prisma.xPost.create({
        data: {
          postId: post.id,
          content: content.x,
          status: PostStatus.SCHEDULED,
          scheduledAt
        }
      });
    }
  }

  // 4. Create Drafts
  console.log("Creating drafts...");
  const drafts = [
    {
      title: "The Death of the 10x Engineer",
      topic: "Engineering Culture",
      idea: "Team velocity matters more than individual heroics.",
      li: "We need to stop worshipping the '10x engineer'. Sustainable software is built by highly aligned teams with good communication, not brilliant jerks working in silos. Here is how we structure our engineering teams for maximum velocity without the burnout.",
      x: "The 10x engineer is a myth that hurts team culture. Focus on 10x teams instead."
    },
    {
      title: "Next.js Turbopack Performance",
      topic: "Web Dev",
      idea: "Benchmarking the new Turbopack against Webpack.",
      li: "We recently migrated our entire frontend build pipeline to Turbopack. The results were staggering: 60% faster cold starts and near-instant HMR. If you haven't made the switch yet, you're leaving developer productivity on the table.",
      x: "Just migrated to Turbopack. Cold starts are down 60%. HMR is instant. Why aren't you using it yet?"
    },
    {
      title: "Weekend Project Idea",
      topic: "Side Projects",
      idea: "Building a local-first notes app.",
      li: "",
      x: ""
    }
  ];

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    
    const post = await prisma.post.create({
      data: {
        title: draft.title,
        topic: draft.topic,
        baseIdea: draft.idea,
        userId: user.id,
        clientDraftKey: `seed-draft-${i}`
      }
    });

    await prisma.linkedInPost.create({
      data: {
        postId: post.id,
        content: draft.li || null,
        status: PostStatus.DRAFT,
      }
    });

    await prisma.xPost.create({
      data: {
        postId: post.id,
        content: draft.x || null,
        status: PostStatus.DRAFT,
      }
    });
  }

  // 5. Create Token Transactions
  console.log("Creating token transactions...");
  await prisma.tokenTransaction.createMany({
    data: [
      { userId: user.id, amount: 100, type: TokenType.ALLOTMENT, createdAt: generatePastDate(15) },
      { userId: user.id, amount: -5, type: TokenType.CONSUMPTION, createdAt: generatePastDate(14) },
      { userId: user.id, amount: -10, type: TokenType.CONSUMPTION, createdAt: generatePastDate(12) },
      { userId: user.id, amount: 50, type: TokenType.ALLOTMENT, createdAt: generatePastDate(5) },
      { userId: user.id, amount: -2, type: TokenType.CONSUMPTION, createdAt: generatePastDate(2) },
      { userId: user.id, amount: -1, type: TokenType.CONSUMPTION, createdAt: generatePastDate(1) },
      { userId: user.id, amount: 1, type: TokenType.REFUND, createdAt: generatePastDate(1) }
    ]
  });

  console.log("✅ Seed completed successfully! Your UI will now look amazing.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
