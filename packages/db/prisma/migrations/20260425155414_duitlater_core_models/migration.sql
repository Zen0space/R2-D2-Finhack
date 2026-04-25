-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'NADI_STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "PoolState" AS ENUM ('DRAFT', 'LOCKED', 'SUGGESTING', 'VOTING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'DISSOLVED');

-- CreateEnum
CREATE TYPE "PoolCategory" AS ENUM ('EQUIPMENT', 'GROCERY', 'SCHOOL_SUPPLIES', 'AGRICULTURAL', 'APPLIANCE', 'TRANSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "VoteChoice" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kampungId" TEXT,
    "individualPaylaterCents" INTEGER NOT NULL DEFAULT 30000,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kampung" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Selangor',
    "districtHint" TEXT,
    "nadiCentreId" TEXT NOT NULL,
    "trustScore" DECIMAL(5,2) NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kampung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "kampungId" TEXT NOT NULL,
    "initiatorUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statedNeed" TEXT NOT NULL,
    "category" "PoolCategory" NOT NULL,
    "targetBudgetCents" INTEGER NOT NULL,
    "combinedCapCents" INTEGER NOT NULL DEFAULT 0,
    "inviteCode" TEXT,
    "selectedCatalogueItemId" TEXT,
    "state" "PoolState" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolMember" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "individualAllowanceAtLockCents" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolSuggestion" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "itemsJson" JSONB NOT NULL,
    "provider" TEXT NOT NULL,
    "suggestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolVote" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "vote" "VoteChoice" NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolTransaction" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "catalogueItemId" TEXT NOT NULL,
    "totalAmountCents" INTEGER NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "PoolTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaylaterObligation" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "poolMemberId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareAmountCents" INTEGER NOT NULL,
    "sharePct" DECIMAL(5,2) NOT NULL,
    "totalCycles" INTEGER NOT NULL DEFAULT 6,
    "cyclesPaid" INTEGER NOT NULL DEFAULT 0,
    "tngReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaylaterObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "tngReference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_kampungId_idx" ON "User"("kampungId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Kampung_nadiCentreId_key" ON "Kampung"("nadiCentreId");

-- CreateIndex
CREATE INDEX "Kampung_state_idx" ON "Kampung"("state");

-- CreateIndex
CREATE INDEX "Kampung_districtHint_idx" ON "Kampung"("districtHint");

-- CreateIndex
CREATE UNIQUE INDEX "Pool_inviteCode_key" ON "Pool"("inviteCode");

-- CreateIndex
CREATE INDEX "Pool_kampungId_idx" ON "Pool"("kampungId");

-- CreateIndex
CREATE INDEX "Pool_initiatorUserId_idx" ON "Pool"("initiatorUserId");

-- CreateIndex
CREATE INDEX "Pool_state_idx" ON "Pool"("state");

-- CreateIndex
CREATE INDEX "Pool_inviteCode_idx" ON "Pool"("inviteCode");

-- CreateIndex
CREATE INDEX "PoolMember_userId_idx" ON "PoolMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolMember_poolId_userId_key" ON "PoolMember"("poolId", "userId");

-- CreateIndex
CREATE INDEX "PoolSuggestion_poolId_idx" ON "PoolSuggestion"("poolId");

-- CreateIndex
CREATE INDEX "PoolVote_poolId_idx" ON "PoolVote"("poolId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolVote_poolId_userId_itemId_key" ON "PoolVote"("poolId", "userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolTransaction_poolId_key" ON "PoolTransaction"("poolId");

-- CreateIndex
CREATE INDEX "PoolTransaction_catalogueItemId_idx" ON "PoolTransaction"("catalogueItemId");

-- CreateIndex
CREATE INDEX "PaylaterObligation_userId_idx" ON "PaylaterObligation"("userId");

-- CreateIndex
CREATE INDEX "PaylaterObligation_transactionId_idx" ON "PaylaterObligation"("transactionId");

-- CreateIndex
CREATE INDEX "Repayment_userId_idx" ON "Repayment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Repayment_obligationId_cycleNumber_key" ON "Repayment"("obligationId", "cycleNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kampungId_fkey" FOREIGN KEY ("kampungId") REFERENCES "Kampung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_kampungId_fkey" FOREIGN KEY ("kampungId") REFERENCES "Kampung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolSuggestion" ADD CONSTRAINT "PoolSuggestion_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolVote" ADD CONSTRAINT "PoolVote_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolVote" ADD CONSTRAINT "PoolVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolTransaction" ADD CONSTRAINT "PoolTransaction_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolTransaction" ADD CONSTRAINT "PoolTransaction_catalogueItemId_fkey" FOREIGN KEY ("catalogueItemId") REFERENCES "MykasihProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaylaterObligation" ADD CONSTRAINT "PaylaterObligation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PoolTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaylaterObligation" ADD CONSTRAINT "PaylaterObligation_poolMemberId_fkey" FOREIGN KEY ("poolMemberId") REFERENCES "PoolMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaylaterObligation" ADD CONSTRAINT "PaylaterObligation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "PaylaterObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
