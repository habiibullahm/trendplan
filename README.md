# TrendPlan

Perencanaan konten TikTok mingguan berbasis tren — niche **Couple Date Ideas**. UI dalam Bahasa Indonesia.

**Live:** [trendplan.vercel.app](https://trendplan.vercel.app) · **Demo tour (read-only):** [/demo](https://trendplan.vercel.app/demo)

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Auth.js (credentials + JWT)
- Prisma 7 + PostgreSQL (`pg` adapter)
- Sonner (toast feedback)
- Deploy: Vercel + Neon (Vercel Postgres / Marketplace)

## Fitur MVP

- Daftar / masuk, onboarding niche & target mingguan
- Tren & rekomendasi (seed mock Couple Date Ideas)
- Planner mingguan (1 slot per hari), edit caption / status / hashtag
- Dashboard progress + riwayat
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
| `npm run db:seed` | Seed 12 tren Couple Date Ideas |
| `npm run db:studio` | Prisma Studio |
| `npm run smoke` | Happy-path smoke test |
| `npm run db:copy-to-prod` | Copy data lokal → Neon (butuh `TARGET_DATABASE_URL`) |

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
| `DATABASE_URL` | (dari Neon) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://trendplan.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |

4. Deploy — build menjalankan `prisma migrate deploy` (`vercel.json`).
5. Seed sekali ke Neon:

```bash
DATABASE_URL="<neon-url>" npm run db:seed
```

Redeploy **tidak** wajib setelah seed.

## Struktur singkat

```
src/app/(app)/     # Dashboard, tren, rekomendasi, planner, riwayat
src/app/actions/   # Auth + planner server actions
src/components/    # UI (nav, forms, toaster, planner board)
prisma/            # Schema, migrations, seed
scripts/           # Smoke + copy-local-to-prod
```

## Catatan

- Session JWT: jika ganti `AUTH_SECRET`, cookie lama invalid (app membersihkan stale cookie).
- `prisma/dev.db` adalah SQLite lama — app memakai PostgreSQL.
