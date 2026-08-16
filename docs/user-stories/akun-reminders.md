# Akun & pengingat

## Story

Sebagai creator, saya ingin mengelola profil (nama, niche, foto, target mingguan) di satu tempat.

Sebagai creator, saya ingin pengingat H-1 supaya saya tidak lupa ide yang harus disiapkan besok.

## Acceptance criteria

- Akun page: edit name, niche, weekly goal; upload profile photo; change password; logout.
- Optional Web Push toggle for plan reminders; browser permission required.
- Daily cron/reminder job notifies about tomorrow’s unfinished items (or under-goal week) per product rules.
- Shortcuts to Riwayat / Rekomendasi from Akun where present.

## Out of scope

SMS reminders, email digest digests as primary channel, iOS push without PWA constraints documented in README.
