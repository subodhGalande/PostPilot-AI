/*
  Warnings:

  - A unique constraint covering the columns `[userId,clientDraftKey]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "clientDraftKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_clientDraftKey_key" ON "Post"("userId", "clientDraftKey");
