# Bantu AI coachmark

## Story

Sebagai creator yang baru buka detail ide, saya ingin petunjuk singkat di tombol **Bantu AI** supaya saya tahu cara mengisi caption dan hashtag tanpa meninggalkan planner.

## Acceptance criteria

- First visit to logged-in idea detail shows a one-step callout on **Bantu AI**.
- Dismiss via **Mengerti**, Escape, click outside, or using **Bantu AI**; persists in `localStorage` (`trendplan-coach-bantu-ai`).
- Does not appear on `/demo`.
- Does not block **Simpan** (no full-page focus trap).
- `prefers-reduced-motion`: static callout, no dim overlay.
- Does not call `/api/ai/caption` by itself.

## Out of scope

Multi-step product tour, Tanya AI chatbot, empty-day **Saran ide**.
