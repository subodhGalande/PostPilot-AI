-- CreateTable
CREATE TABLE "public"."revokedToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revokedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revokedToken_token_key" ON "public"."revokedToken"("token");
