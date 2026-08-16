-- CreateTable
CREATE TABLE "WeekPlanMember" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeekPlanMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlanInvite" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeekPlanInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanMember_weekPlanId_key" ON "WeekPlanMember"("weekPlanId");

-- CreateIndex
CREATE INDEX "WeekPlanMember_userId_idx" ON "WeekPlanMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanInvite_tokenHash_key" ON "WeekPlanInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "WeekPlanInvite_weekPlanId_idx" ON "WeekPlanInvite"("weekPlanId");

-- AddForeignKey
ALTER TABLE "WeekPlanMember" ADD CONSTRAINT "WeekPlanMember_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanMember" ADD CONSTRAINT "WeekPlanMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanInvite" ADD CONSTRAINT "WeekPlanInvite_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
