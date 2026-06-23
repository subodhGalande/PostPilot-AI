/*
  Warnings:

  - You are about to drop the column `onboarding` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `VerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `VerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `onboarded` on the `VerificationToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "onboarding",
ADD COLUMN     "accountType" "public"."AccountType",
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."VerificationToken" DROP COLUMN "accountType",
DROP COLUMN "industry",
DROP COLUMN "onboarded";
