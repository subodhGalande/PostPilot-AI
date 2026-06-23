/*
  Warnings:

  - You are about to drop the `revokedToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('BRAND', 'INFLUENCER');

-- AlterTable
ALTER TABLE "public"."VerificationToken" ADD COLUMN     "accountType" "public"."AccountType",
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."revokedToken";

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");
