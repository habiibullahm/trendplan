# AI caption assist

## Story

Sebagai creator, saya ingin bantuan mengisi caption dan hashtag dari ide/tren yang sudah ada supaya lebih cepat menulis, tanpa meninggalkan planner.

## Acceptance criteria

- On idea detail, **Bantu AI** fills caption/hashtags from niche + existing idea/trend context.
- Empty planner days use catalog **Saran ide** ([empty-slot-assist.md](empty-slot-assist.md)); this story stays caption-only.
- First visit shows a one-step coachmark on the button ([bantu-ai-coachmark.md](bantu-ai-coachmark.md)).
- Enabled only when `AI_ASSIST_ENABLED` + provider key are set; otherwise local template suggestions still work.
- Does not scrape live TikTok FYP; planner stays manual-first.
- Failures show Indonesian toast/error; user can edit results after assist.

## Out of scope

Auto-scheduling posts, image/video generation, autonomous multi-week content calendars.
