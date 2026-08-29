# Admin feedback inbox

## Story

Sebagai owner TrendPlan, saya ingin melihat masukan dari halaman Akun di satu inbox, mendapat email saat ada masukan baru, dan membalas masukan supaya pengirim mendapat email balasan (kalau email transaksi aktif).

## Acceptance criteria

- `/admin/feedback` lists up to 50 newest `Feedback` rows (category, message preview, submitter, time).
- Access only when the signed-in user’s email is in `ADMIN_EMAILS` (comma-separated). Empty allowlist → 404 for everyone.
- Category filter via `?category=saran|bug|lainnya`; invalid/missing = all.
- Row opens a detail modal with full message and **Salin**.
- Admin can write a reply (10–2000 chars); saved on the row (`adminReply`, `repliedAt`, `repliedByEmail`); list shows **Dibalas**.
- After reply save, soft-fail email the submitter (`User.email`) with the reply; save succeeds if mail fails / is disabled.
- Overwrite / re-send allowed (“Perbarui & kirim ulang”).
- Akun shows **Lihat masukan** only for allowlisted emails.
- After successful submit, when `TRANSACTIONAL_EMAIL_ENABLED`, soft-fail email each admin (submit still succeeds if mail fails).
- `/demo` unchanged; no bottom-nav admin item for normal users.

## Out of scope

DB `role`, unread/`readAt`, delete, in-app user reply thread, demo mirror.
