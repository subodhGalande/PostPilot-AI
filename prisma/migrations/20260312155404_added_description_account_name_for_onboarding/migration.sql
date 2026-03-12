-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "User_id_idx" ON "public"."User"("id");
