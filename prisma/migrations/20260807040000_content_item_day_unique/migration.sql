-- Enforce one content item per day within a week plan
CREATE UNIQUE INDEX "ContentItem_weekPlanId_dayOfWeek_key" ON "ContentItem"("weekPlanId", "dayOfWeek");
