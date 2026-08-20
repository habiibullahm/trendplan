# Admin feedback inbox

## Story

Sebagai owner TrendPlan, saya ingin melihat masukan dari halaman Akun di satu inbox, dan mendapat email saat ada masukan baru (kalau email transaksi aktif).

## Acceptance criteria

- `/admin/feedback` lists up to 50 newest `Feedback` rows (category, message preview, submitter, time).
- Access only when the signed-in user’s email is in `ADMIN_EMAILS` (comma-separated). Empty allowlist → 404 for everyone.
- Category filter via `?category=saran|bug|lainnya`; invalid/missing = all.
- Row opens a detail modal with full message and **Salin**.
- Akun shows **Lihat masukan** only for allowlisted emails.
- After successful submit, when `TRANSACTIONAL_EMAIL_ENABLED`, soft-fail email each admin (submit still succeeds if mail fails).
- `/demo` unchanged; no bottom-nav admin item for normal users.

## Out of scope

DB `role`, unread/`readAt`, delete/reply-from-app, demo mirror.
