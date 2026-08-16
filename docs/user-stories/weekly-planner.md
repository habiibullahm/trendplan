# Weekly planner

## Story

Sebagai creator, saya ingin menyusun ide konten TikTok per hari dalam satu minggu supaya saya punya rencana yang jelas.

Sebagai creator, saya ingin mengedit caption, hashtag, dan status ide, serta menyalin teks siap tempel ke TikTok.

## Acceptance criteria

- Planner shows month + Minggu 1–N navigation; one content slot per day.
- Create ide from empty day; edit title/hook/caption/hashtags/status on detail.
- Status flow supports planning → ready → Posted (labels in Indonesian UI).
- **Salin daftar** copies the week list; detail can copy caption/hashtags for TikTok.
- Soft-delete shows brief **Urungkan** toast, then permanent delete.
- **Aktivitas** tab supports daily life/date activities (many per day), separate from content slots.
- Partner-shared weeks use the same board when membership is active (`getWeekPlanForViewer`).

## Out of scope

Multi-slot per day for content, calendar drag across months as a full Gantt, live TikTok publish.
