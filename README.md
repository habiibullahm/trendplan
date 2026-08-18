# TrendPlan

Perencanaan konten TikTok mingguan berbasis tren — niche **Couple Date Ideas**. UI dalam Bahasa Indonesia.

**Live:** [trendplan.vercel.app](https://trendplan.vercel.app) · **Demo tour (read-only):** [/demo](https://trendplan.vercel.app/demo)

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Auth.js (credentials + JWT)
- Prisma 7 + PostgreSQL (`pg` adapter)
- Sonner (toast feedback)
- **shadcn/ui** (initialized; brand tokens `coral` / `paper` / `ink`)
- Deploy: Vercel + Neon · Vercel Blob · Web Push (VAPID)

## Fitur MVP

- Daftar / masuk, onboarding niche & target mingguan
- Tren & rekomendasi (seed mock Couple Date Ideas) dengan caption & hashtag saran
- Planner mingguan (1 slot per hari): navigasi bulan + Minggu 1–N, buat ide sendiri, edit caption / status / hashtag
- Salin caption siap TikTok (detail) dan Salin minggu (daftar hari)
- **Bagikan minggu ke partner** — undang 1 partner via tautan (opsional email) ke week plan yang sama
- Hapus dengan toast Urungkan singkat, lalu hapus permanen
- Dashboard progress + riwayat
- Akun: identitas, foto profil (unggah), target mingguan (ubah), **pengingat plan** (Web Push), pintasan Riwayat/Rekomendasi, keluar
- Demo baca saja di `/demo` (embed portfolio)
- Toast sukses/error (Bahasa Indonesia)

## User stories

See [docs/user-stories/](docs/user-stories/README.md). Highlights:

- [Auth & onboarding](docs/user-stories/auth-onboarding.md)
- [Weekly planner](docs/user-stories/weekly-planner.md)
- [Partner week share](docs/user-stories/partner-week-share.md)
- [AI caption assist](docs/user-stories/ai-caption-assist.md)
- [Empty-slot Saran ide](docs/user-stories/empty-slot-assist.md)

## Guides

- [App structure](docs/app-structure.md)
- [How to add a feature](docs/how-to-add-feature.md)
- [Conventions](docs/conventions.md)
- [E2E guide](docs/e2e-guide.md)

## AI assist

Tombol **Bantu AI** di detail ide (Groq) dan **Saran ide** di hari kosong planner (katalog tren, bukan riset FYP live). Env: lihat [`.env.example`](.env.example) dan [AI caption assist](docs/user-stories/ai-caption-assist.md).

## Setup lokal

**Prasyarat:** Node.js 20+, PostgreSQL di `localhost:5432` (atau sesuaikan URL). Opsional: `docker-compose.yml`.

```bash
npm install
cp .env.example .env
```

Minimal `.env` untuk boot lokal:

```env
DATABASE_URL="postgresql://trendplan:trendplan@localhost:5432/trendplan"
AUTH_SECRET="generate-a-long-random-string"
AUTH_TRUST_HOST="true"
```

Email, Web Push, Blob, AI, dll. → komentar di [`.env.example`](.env.example). Buat DB/user `trendplan` jika belum ada.

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

**E2E:** `npm run test:e2e` — lihat [docs/e2e-guide.md](docs/e2e-guide.md).

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run db:migrate` | Migrate (dev) |
| `npm run db:deploy` | Migrate (prod/CI) |
| `npm run db:seed` | Seed tren Couple Date Ideas |
| `npm run db:studio` | Prisma Studio |
| `npm run smoke` | Happy-path smoke |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright e2e |
| `npm run verify` | typecheck + unit + e2e + build (sama dengan CI) |
| `npm run db:copy-to-prod` | Copy data lokal → Neon (`TARGET_DATABASE_URL`) |

Lainnya (`db:clear-lock`, `smoke:modal`, …) → `package.json`.

## CI & hooks

- **pre-commit** (Husky): block staged secrets + `lint-staged` (ESLint file staged). Tidak ada pre-push.
- **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) menjalankan `npm run verify` pada PR dan push ke `main`.
- **Branch protection:** Settings → Branches → `main` → require status check **verify**.
- Lokal opsional: `npm run verify`. Skip hooks: `HUSKY=0`.

## Deploy (Vercel)

1. Import repo ke Vercel.
2. Pasang **Neon** dari [Vercel Marketplace](https://vercel.com/marketplace/neon).
3. Set env Production (detail penuh di [`.env.example`](.env.example)):

| Variable | Contoh |
|----------|--------|
| `DATABASE_URL` | Neon pooled (`…-pooler…`) |
| `DIRECT_URL` | Neon direct (tanpa `-pooler`) untuk migrate |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://trendplan.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_*` / `CRON_SECRET` | Web Push + cron |
| Email / AI keys | Opsional — lihat `.env.example` |

4. Deploy — build menjalankan migrate (`vercel.json`). Cron `0 13 * * *` UTC (= **20:00 WIB**) → `/api/cron/reminders`.
5. Seed sekali: `DATABASE_URL="<neon-url>" npm run db:seed`

Copy lokal → Neon:

```bash
TARGET_DATABASE_URL="postgresql://...@....neon.tech/neondb?sslmode=require" npm run db:copy-to-prod
```

**P1002** (advisory lock): pakai `DIRECT_URL` (bukan pooler), lalu `npm run db:clear-lock` dan `npm run db:deploy`. Vercel memakai `db:deploy:retry` untuk race deploy.

## Branching

```bash
git checkout main && git pull origin main
git checkout -b feature/nama-fitur
# …edit, commit…
git push -u origin HEAD
gh pr create --base main
```

Satu PR ≈ satu fitur. Preview: Vercel; production setelah merge ke `main`.

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
