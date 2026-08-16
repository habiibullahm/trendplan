# Auth & onboarding

## Story

Sebagai creator baru, saya ingin daftar dan masuk supaya saya bisa menyimpan rencana konten saya.

Sebagai creator baru setelah daftar, saya ingin memilih niche dan target mingguan supaya rekomendasi dan progress cocok dengan saya.

## Acceptance criteria

- Register and login with email/password; Indonesian validation and toast errors.
- After first login (when onboarding incomplete), user is guided to `/onboarding` (niche + weekly goal 1–7).
- Completed onboarding lands on dashboard; incomplete users cannot use app shell routes without finishing (or verify-email when required).
- Change password from Akun with current password (always available).
- Forgot-password / email verification only when transactional email flags are on.

## Out of scope

OAuth social login, magic-link-only auth, multi-tenant orgs.
