-- CreateEnum
DO $$ BEGIN CREATE TYPE "Provider" AS ENUM ('CREDENTIALS', 'GOOGLE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AccountType" AS ENUM ('BRAND', 'INFLUENCER'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "LinkedInPost" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LinkedInPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "XPost" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "mode" TEXT,
    "threadPosts" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "XPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LinkedInPost_postId_key" ON "LinkedInPost"("postId");
CREATE INDEX IF NOT EXISTS "LinkedInPost_status_scheduledAt_idx" ON "LinkedInPost"("status", "scheduledAt");
CREATE UNIQUE INDEX IF NOT EXISTS "XPost_postId_key" ON "XPost"("postId");
CREATE INDEX IF NOT EXISTS "XPost_status_scheduledAt_idx" ON "XPost"("status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "LinkedInPost" ADD CONSTRAINT "LinkedInPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;