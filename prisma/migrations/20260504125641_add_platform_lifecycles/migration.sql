-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "linkedinScheduledAt" TIMESTAMP(3),
ADD COLUMN     "linkedinStatus" "PostStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "xScheduledAt" TIMESTAMP(3),
ADD COLUMN     "xStatus" "PostStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Post_linkedinStatus_linkedinScheduledAt_idx" ON "Post"("linkedinStatus", "linkedinScheduledAt");

-- CreateIndex
CREATE INDEX "Post_xStatus_xScheduledAt_idx" ON "Post"("xStatus", "xScheduledAt");
