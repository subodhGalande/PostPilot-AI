-- DropIndex
DROP INDEX IF EXISTS "Post_linkedinStatus_linkedinScheduledAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Post_userId_status_updatedAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Post_xStatus_xScheduledAt_idx";

-- Drop old Post columns first (so enum can be safely pruned)
ALTER TABLE "Post" DROP COLUMN IF EXISTS "content",
DROP COLUMN IF EXISTS "linkedinScheduledAt",
DROP COLUMN IF EXISTS "linkedinStatus",
DROP COLUMN IF EXISTS "scheduledAt",
DROP COLUMN IF EXISTS "status",
DROP COLUMN IF EXISTS "xScheduledAt",
DROP COLUMN IF EXISTS "xStatus";

-- Add new Post columns
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "baseIdea" TEXT,
ADD COLUMN IF NOT EXISTS "model" TEXT,
ADD COLUMN IF NOT EXISTS "topic" TEXT;

-- AlterEnum: prune PostStatus (remove PUBLISHED, ARCHIVED)
BEGIN;
CREATE TYPE "PostStatus_new" AS ENUM ('DRAFT', 'SCHEDULED');
ALTER TABLE "public"."LinkedInPost" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."XPost" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LinkedInPost" ALTER COLUMN "status" TYPE "PostStatus_new" USING ("status"::text::"PostStatus_new");
ALTER TABLE "XPost" ALTER COLUMN "status" TYPE "PostStatus_new" USING ("status"::text::"PostStatus_new");
ALTER TYPE "PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "PostStatus_new" RENAME TO "PostStatus";
DROP TYPE IF EXISTS "PostStatus_old";
ALTER TABLE "LinkedInPost" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "XPost" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- Add User security columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");
