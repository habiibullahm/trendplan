# Empty-slot Saran ide

## Story

Sebagai creator, saya ingin saran tren untuk **hari kosong** di planner supaya saya bisa isi slot dari katalog yang sudah ada, tanpa riset FYP live.

## Acceptance criteria

- Empty day on the logged-in planner shows **Saran ide** next to **+ Buat ide**.
- Suggestions are 1–2 unused curated trends for the user’s niche, ranked by `score` (same catalog as Tren/Rekomendasi).
- User picks an empty day (pre-filled from the slot) and confirms **Pakai** via the existing add-to-planner action.
- Occupied day: no **Saran ide**. Week full or no unused trends: no **Saran ide**.
- Shared week uses the same access as **Pakai** (`getWeekPlanForViewer` / `weekPlanAccessWhere`).
- Does not call Groq or send `/media/trends/**` to a model. `/demo` stays read-only (no control).
- After Pakai, caption/hashtag still happen later with **Bantu AI** on idea detail.

## Out of scope

Auto-fill all empty days, live TikTok/FYP research, vision over cover/video, Tanya AI chatbot, replacing v1 caption assist.
