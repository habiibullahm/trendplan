# TrendPlan

TrendPlan is a web app for planning weekly TikTok content: pick a niche, then add daily post ideas with captions and hashtags. The UI is in Indonesian.

Author: Muhammad Habiibullah

## Live

- App: [https://trendplan.site](https://trendplan.site)
- Read-only demo: [https://trendplan.site/demo/dashboard](https://trendplan.site/demo/dashboard)

## Stack

From `package.json` dependencies:

- Next.js 16.4.3
- React 19.2.8
- next-auth
- Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`, `pg`)
- shadcn, sonner, Zod
- `@vercel/blob`, web-push
- `ai`, `@ai-sdk/openai`

## Run locally

You need Node.js and PostgreSQL. An optional local database is in [docker-compose.yml](docker-compose.yml).

```bash
npm install
cp .env.example .env
npm run db:deploy
npm run db:seed
npm run dev
```

Then open `http://localhost:3000`.

Required env vars (names and local examples live in [.env.example](.env.example); do not put real secrets in git):

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`

Optional vars in that file cover Blob, Web Push, email, admin inbox (`ADMIN_EMAILS`), and AI assist.

Scripts from `package.json`:

| Command | Script |
|---|---|
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | `tsx prisma/seed.ts` |
| `npm run dev` | `next dev` |
| `npm run build` | `prisma generate && next build` |
| `npm start` | `next start` |
| `npm test` | unit tests |
