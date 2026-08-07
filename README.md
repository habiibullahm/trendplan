# TrendPlan

Perencanaan konten TikTok mingguan berbasis tren — niche **Couple Date Ideas**. UI dalam Bahasa Indonesia.

**Live:** [trendplan.vercel.app](https://trendplan.vercel.app) · **Demo tour (read-only):** [/demo](https://trendplan.vercel.app/demo)

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Auth.js (credentials + JWT)
- Prisma 7 + PostgreSQL (`pg` adapter)
- Sonner (toast feedback)
- Deploy: Vercel + Neon (Vercel Postgres / Marketplace)
- Vercel Blob (foto profil Akun)

## Fitur MVP

- Daftar / masuk, onboarding niche & target mingguan
- Tren & rekomendasi (seed mock Couple Date Ideas) dengan caption & hashtag saran
- Planner mingguan (1 slot per hari): navigasi bulan + Minggu 1–N, buat ide sendiri, edit caption / status / hashtag
- Salin caption siap TikTok (detail) dan Salin minggu (daftar hari)
- Hapus dengan toast Urungkan singkat, lalu hapus permanen
- Dashboard progress + riwayat
- Akun: identitas, foto profil (unggah), target mingguan (ubah), pintasan Riwayat/Rekomendasi, keluar
- Demo baca saja di `/demo` (embed portfolio)
- Toast sukses/error (Bahasa Indonesia)

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
| `AUTH_URL` | `https://trendplan.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |
| `BLOB_READ_WRITE_TOKEN` | (dari Vercel Blob store) |

4. Deploy — build menjalankan `prisma migrate deploy` (`vercel.json`).
5. Seed sekali ke Neon:

```bash
DATABASE_URL="<neon-url>" npm run db:seed
```

Jika migrate gagal dengan **P1002** (advisory lock timeout): pastikan `DIRECT_URL` mengarah ke koneksi **direct** (bukan `-pooler`), lalu:

```bash
npm run db:clear-lock
DIRECT_URL="<neon-direct-url>" npm run db:deploy
```

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
src/app/actions/            # Auth + onboarding server actions
src/components/layout/      # App shell, nav, toaster
src/components/motion/      # Shared motion helpers
src/components/ui/          # Primitives (Button, FormField, Input, Badge, …)
src/features/planner/       # Planner components, lib, server actions
src/features/auth/          # Auth + onboarding forms + Akun goal editor
src/lib/                    # Shared (db, prisma, session, week, labels, cn)
prisma/                     # Schema, migrations, seed
scripts/                    # Smoke + copy-local-to-prod
```
