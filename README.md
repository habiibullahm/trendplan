# TrendPlan

Perencanaan konten TikTok mingguan berbasis tren — niche **Couple Date Ideas**. UI dalam Bahasa Indonesia.

**Live:** [trendplan.vercel.app](https://trendplan.vercel.app) · **Demo tour (read-only):** [/demo](https://trendplan.vercel.app/demo)

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Auth.js (credentials + JWT)
- Prisma 7 + PostgreSQL (`pg` adapter)
- Sonner (toast feedback)
- **shadcn/ui** (initialized; `Card` / `Separator` / `Skeleton` / `Button` / `Dialog` available). App code still imports TrendPlan `Button` and `Modal` wrappers (shadcn-backed, same props); `ChipButton` stays custom. Prefer shadcn primitives for new UI where they exist; brand tokens (`coral`, `paper`, `ink`) map to shadcn CSS variables.
- Deploy: Vercel + Neon (Vercel Postgres / Marketplace)
- Vercel Blob (foto profil Akun)
- Web Push (`web-push` + VAPID) — pengingat plan H-1 + kabar update

## Fitur MVP

- Daftar / masuk, onboarding niche & target mingguan
- Tren & rekomendasi (seed mock Couple Date Ideas) dengan caption & hashtag saran
- Planner mingguan (1 slot per hari): navigasi bulan + Minggu 1–N, buat ide sendiri, edit caption / status / hashtag
- Salin caption siap TikTok (detail) dan Salin minggu (daftar hari)
- Hapus dengan toast Urungkan singkat, lalu hapus permanen
- Dashboard progress + riwayat
- Akun: identitas, foto profil (unggah), target mingguan (ubah), **pengingat plan** (Web Push), pintasan Riwayat/Rekomendasi, keluar
- Demo baca saja di `/demo` (embed portfolio)
- Toast sukses/error (Bahasa Indonesia)

## Roadmap

- **AI bantu rencana konten** — tombol **Bantu AI** di detail ide mengisi caption & hashtag dari niche + tren/ide yang sudah ada di DB (Vercel AI SDK + OpenAI). Bukan riset FYP live / scraper TikTok; planner tetap manual-first. Aktifkan dengan `AI_ASSIST_ENABLED=true` dan `OPENAI_API_KEY` (lihat `.env.example`). Tanpa key, saran template lokal tetap dipakai.

## Setup lokal

### Prasyarat

- Node.js 20+
- PostgreSQL di `localhost:5432` (atau sesuaikan URL)

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Environment (`.env`)

```env
DATABASE_URL="postgresql://trendplan:trendplan@localhost:5432/trendplan"
AUTH_SECRET="generate-a-long-random-string"
AUTH_TRUST_HOST="true"
```

`AUTH_TRUST_HOST=true` dibutuhkan untuk Auth.js lokal tanpa `AUTH_URL`. Di production, set `AUTH_URL` ke URL kanonis; `trustHost` aktif otomatis di Vercel (`VERCEL=1`) atau saat `AUTH_TRUST_HOST=true`. Self-hosted: andalkan `AUTH_URL` dan jangan percaya `X-Forwarded-Host` kecuali reverse proxy menimpa header itu.

Rate limit login/register disimpan di Postgres (`RateLimitBucket`) supaya berlaku lintas instance serverless (bukan hanya in-memory per proses).

### Auth hardening (password + email)

- **Ubah password** di Akun (selalu aktif; pakai password saat ini, tanpa email).
- **Lupa password via email** → `/forgot-password` — **default OFF** sampai domain Resend diverifikasi. Aktifkan dengan `TRANSACTIONAL_EMAIL_ENABLED=true` dan `NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED=true`, plus `RESEND_API_KEY` / `EMAIL_FROM`.
- **Verifikasi email**: **default OFF** (`EMAIL_VERIFICATION_REQUIRED` opt-in). Soft-gate ke `/verify-email` hanya saat diwajibkan.

Buat database/user `trendplan` di Postgres lokal jika belum ada.

### 3. Migrate + seed

```bash
npx prisma migrate deploy
npm run db:seed
```

### 4. Dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Opsional: Postgres terisolasi via Docker — lihat `docker-compose.yml` (pastikan port 5432 bebas).

### Web Push (pengingat plan)

Satu toggle di **Akun → Pengingat plan** mengaktifkan:

- Reminder **H-1 jam 20:00 WIB** (besok ada ide belum Posted, atau target minggu belum penuh)
- Kabar **update aplikasi** (broadcast ops)

Generate kunci:

```bash
npx web-push generate-vapid-keys
```

Isi `.env` / `.env.local`: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`.

Uji lokal (setelah Aktifkan di `/akun` dan ada ide di **hari besok**):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Broadcast update (ops):

```bash
curl -X POST http://localhost:3000/api/push/broadcast \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"title":"Update TrendPlan","body":"Fitur baru di Akun — cek sekarang.","url":"/akun"}'
```

**Catatan iOS:** Web Push biasanya butuh Add to Home Screen; desktop Chrome/Firefox/Edge lebih mudah untuk uji lokal.

### 5. E2E (Playwright)

Thin browser smoke (Chromium): public shells, and optional authenticated planner journey.

```bash
npm run test:e2e
# or interactive:
npm run test:e2e:ui
```

- Without creds: public smoke runs; auth setup/journey are skipped.
- With auth: copy `.env.e2e.example` → `.env.e2e`, set `E2E_EMAIL` / `E2E_PASSWORD` for an **onboarded** user. Setup writes `.auth/user.json` (gitignored) once per run.

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run db:migrate` | Migrate (dev) |
| `npm run db:deploy` | Migrate (prod/CI) |
| `npm run db:clear-lock` | Clear stuck Prisma migrate advisory lock (P1002) |
| `npm run db:seed` | Seed 12 tren Couple Date Ideas |
| `npm run db:studio` | Prisma Studio |
| `npm run smoke` | Happy-path smoke test |
| `npm run smoke:modal` | Modal/Dialog UI smoke (dismiss-while-loading, avatar picker focus, sheet layout) |
| `npm run test:e2e` | Playwright e2e (public smoke; auth journeys if `.env.e2e`) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run db:copy-to-prod` | Copy data lokal → Neon (butuh `TARGET_DATABASE_URL`) |
| `npm test` | Unit tests (`src/**/*.test.ts`) — juga di pre-push |

## Git hooks (Husky)

Setelah `npm install`, Husky aktif otomatis (`prepare`).

| Hook | Isi | Tujuan |
|------|-----|--------|
| **pre-commit** | Block staged `.env`/credential filenames + `lint-staged` → ESLint **hanya** file staged `*.{ts,tsx,js,mjs}` | Commit cepat (~detik) |
| **pre-push** | `npm test` | Cek ringan sebelum push |

Tidak dijalankan di pre-commit: `eslint .`, full smoke, `prisma generate`, `next build`.

Darurat (skip hooks):

```bash
HUSKY=0 git commit -m "…"
HUSKY=0 git push
```

Copy ke production:

```bash
TARGET_DATABASE_URL="postgresql://...@....neon.tech/neondb?sslmode=require" npm run db:copy-to-prod
```

## Deploy (Vercel)

1. Import repo ke Vercel.
2. Pasang **Neon** dari [Vercel Marketplace](https://vercel.com/marketplace/neon) (inject `DATABASE_URL`).
3. Set env Production:

| Variable | Contoh |
|----------|--------|
| `DATABASE_URL` | Neon pooled URL (`…-pooler…`) for the app |
| `DIRECT_URL` | Neon direct URL (no `-pooler`) for `prisma migrate` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://trendplan.vercel.app` (URL kanonis; lebih aman daripada mengandalkan Host header) |
| `AUTH_TRUST_HOST` | `true` (opsional di Vercel — `VERCEL=1` sudah mengaktifkan `trustHost`) |
| `EMAIL_FROM` | `TrendPlan <noreply@yourdomain.com>` (domain harus verified di Resend) |
| `RESEND_API_KEY` | Resend API key (hanya dipakai jika transactional email ON) |
| `TRANSACTIONAL_EMAIL_ENABLED` | `true` setelah domain ready; **default off** |
| `NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED` | `true` agar UI tampilkan “Lupa password?” |
| `EMAIL_VERIFICATION_REQUIRED` | Opt-in `true`; **default off** |
| `BLOB_READ_WRITE_TOKEN` | (dari Vercel Blob store) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID (sama dengan `VAPID_PUBLIC_KEY`) |
| `VAPID_PUBLIC_KEY` | Public VAPID |
| `VAPID_PRIVATE_KEY` | Private VAPID (server only) |
| `VAPID_SUBJECT` | `mailto:you@example.com` |
| `CRON_SECRET` | Bearer untuk cron H-1 + `/api/push/broadcast` |

4. Deploy — build menjalankan `prisma migrate deploy` (`vercel.json`). Cron harian `0 13 * * *` UTC (= **20:00 WIB**) memanggil `/api/cron/reminders`.
5. Seed sekali ke Neon:

```bash
DATABASE_URL="<neon-url>" npm run db:seed
```

Jika migrate gagal dengan **P1002** (advisory lock timeout): pastikan `DIRECT_URL` mengarah ke koneksi **direct** (bukan `-pooler`), lalu:

```bash
DIRECT_URL="<neon-direct-url>" npm run db:clear-lock
DIRECT_URL="<neon-direct-url>" npm run db:deploy
```

Vercel build memakai `npm run db:deploy:retry` (retry otomatis saat P1002 dari deploy bersamaan).
Redeploy **tidak** wajib setelah seed.

## Branching strategy

Kerjakan fitur di branch terpisah, lalu merge lewat PR ke `main` (jangan push langsung ke `main`).

```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur
# …edit, commit…
git push -u origin HEAD
gh pr create --base main
```

Catatan penting:

- **Base** branch dari `main` yang sudah up to date.
- **Upstream** harus `origin/feature/…`, bukan `origin/main`. Hindari `git checkout -b feature/x origin/main` bila itu membuat branch track `main` — `git push` tanpa argumen bisa mendorong commit ke `main`.
- Setelah `git push -u origin HEAD`, buka PR ke `main` dan merge lewat GitHub/Vercel.
- Satu PR ≈ satu fitur/perbaikan yang bisa di-review sendiri.

## Struktur singkat

```
src/app/(app)/              # Routes: dashboard, tren, rekomendasi, planner, riwayat, akun
src/app/loadings/           # Route page loading compositions
src/app/api/auth/           # Auth.js + clear-session handlers
src/components/layout/      # App shell, nav, toaster
src/components/loading/     # Shared loading shell + skeleton blocks
src/components/theme/       # Theme provider, script, ThemeToggle
src/components/motion/      # Shared motion helpers
src/components/ui/          # Primitives (Button, FormField, Input, Badge, …)
src/features/planner/       # Planner components, lib, server actions
src/features/auth/          # Auth UI + feature server actions (login, password, profile, …)
src/lib/auth/               # Auth infra (session, JWT claims, tokens, validation, …)
src/lib/                    # Shared (db, prisma, mail, week, labels, cn, rate-limit)
src/auth.ts + auth.config.ts
prisma/                     # Schema, migrations, seed
scripts/                    # Smoke + copy-local-to-prod
```
