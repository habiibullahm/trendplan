-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ContentItem_deletedAt_idx" ON "ContentItem"("deletedAt");
