# E2E testing guide (Next.js + Playwright)

Practical best practices for browser end-to-end tests on Next.js apps. Examples below match this repo’s layout (`e2e/`, Playwright, App Router).

## Goals

E2E proves **critical user journeys work in a real browser**. It is not a replacement for unit/integration tests.

| Layer | Speed | What to cover |
|-------|-------|----------------|
| Unit (`*.test.ts`) | Fast | Pure logic, schemas, helpers |
| Integration / DB | Medium | Transactions, ACL, unique constraints |
| E2E (Playwright) | Slow | Auth shells, happy paths, multi-user flows |

Prefer fewer, stable journeys over many brittle UI asserts.

## Project layout

```
e2e/
  auth.setup.ts          # login once → storageState
  smoke.spec.ts          # public / no auth
  helpers/               # login, fixtures, second users
  journeys/              # authenticated feature flows
    planner.spec.ts
    aktivitas.spec.ts
    week-share.spec.ts   # one feature = one file when setup differs
playwright.config.ts
.env.e2e.example         # copy → .env.e2e (gitignored)
.auth/                   # storageState (gitignored)
```

**Config pattern that scales:**

- **Smoke project** — `*.spec.ts` outside `journeys/`, no auth dependency.
- **Setup project** — writes `.auth/user.json`.
- **Authenticated project** — `journeys/**`, `dependencies: ["setup"]`.

Keep public smoke runnable even when credentials are missing (skip journeys, don’t fail the whole suite).

## Smoke vs journeys

| Kind | Auth | Scope | Examples |
|------|------|-------|----------|
| **Smoke** | No | Pages render, redirects, demo shells | Landing, login form, invite → login `callbackUrl` |
| **Journey** | Yes | Multi-step product flow | Create ide, share week → partner accept → revoke |

**Rule:** one primary journey per feature when setup differs (second user, clipboard, email). Do **not** dump partner share into the planner journey — different fixtures and failure modes.

Tiny cross-checks are fine in smoke (e.g. demo “Bagikan” disabled). Full ACL/multi-user belongs in its own journey.

## Auth: storageState, not login-every-test

1. Setup logs in once with credentials.
2. Persist cookies via `storageState`.
3. Journeys use `test.use({ storageState: AUTH_STORAGE_PATH })`.

Benefits: faster runs, fewer flake points on `/login`, one place to update when auth UI changes.

Requirements for this pattern:

- Seeded / known user that completes onboarding (lands on `/dashboard`).
- Credentials only via env (`.env.e2e`), never committed.
- Second actors (partner) get their own helper + context, not the owner’s storageState.

## Multi-user flows

For invite/accept/share:

1. Owner browser: authenticated storageState.
2. Partner: `browser.newContext()` + `loginWithCredentials` (or separate storage file).
3. Share invite URL via clipboard or constructed URL — never hardcode secrets.
4. Reset shared state at the start (revoke pending seat) so the test is idempotent.

Keep multi-user specs **isolated** from single-user planner journeys.

## Selectors (Next.js App Router)

Prefer accessible queries over CSS/XPath:

```ts
page.getByRole("button", { name: "Salin tautan undangan" });
page.getByLabel("Email");
page.getByRole("heading", { name: "Buat ide" });
```

Avoid coupling to:

- Generated class hashes / CSS modules
- Deep DOM structure that redesigns often
- Exact copy that changes weekly (use regex when copy has variants)

For soft client navigations, assert **URL + a stable landmark** (heading, main text), not only `networkidle` (unreliable with Next streaming/RSC).

## Flake reduction (Next.js-specific)

- **`webServer` + `reuseExistingServer`** — reuse local `npm run dev`; start fresh in CI.
- **Hard `goto` for first paint** of a journey when soft-nav left stale UI.
- **Expect with timeouts** on post-action navigation (`redirect` after server actions).
- **Poll async side effects** (clipboard, toast) instead of fixed `waitForTimeout`.
- **CI:** fewer workers, one retry, `trace: on-first-retry`, `forbidOnly`.
- **Idempotent setup** — clear partner seat / free a day slot before asserting, or `test.skip` with a clear reason when the seed DB can’t support the run.

Do not use arbitrary sleeps as “fixes.”

## What belongs in E2E vs not

**Do test in E2E**

- Critical happy paths (create content, share week, accept invite)
- Auth gates and callback preservation (logged-out invite → login)
- Obvious regressions users would hit in production

**Prefer unit/integration instead**

- Prisma unique constraints, advisory locks, token hashing
- Rate-limit math, pure date/week helpers
- HTML escape helpers, schema validation

**Avoid**

- Full visual regression of every page (unless you adopt a dedicated visual tool)
- Testing every edge copy string
- Driving Resend/real SMS in CI (mock or feature-flag off)

## Environment

| Variable | Purpose |
|----------|---------|
| `E2E_EMAIL` / `E2E_PASSWORD` | Primary onboarded user |
| `E2E_PARTNER_*` | Optional second user for share journeys |
| `PLAYWRIGHT_BASE_URL` | Override default `http://localhost:3000` |
| `CI` | Stricter Playwright settings |

Never commit `.env.e2e` or `.auth/*.json`.

## Commands

```bash
npm run test:e2e      # headless
npm run test:e2e:ui   # interactive debug
```

Filter when iterating:

```bash
npx playwright test e2e/smoke.spec.ts
npx playwright test e2e/journeys/week-share.spec.ts
```

## Checklist for a new journey

1. Is this a **user-visible** critical path? If not, write a unit/integration test.
2. New **fixture needs** (second user, clipboard, empty day)? → new file under `e2e/journeys/`.
3. Can smoke cover a **thin** public/demo slice without auth?
4. Use roles/labels; assert URL + landmark after server actions.
5. Make the test **re-runnable** (reset share seat / skip with reason).
6. Keep secrets in `.env.e2e`; document new vars in `.env.e2e.example`.

## TrendPlan mapping

| Spec | Role |
|------|------|
| `e2e/smoke.spec.ts` | Public shells + demo Bagikan + invite callback |
| `e2e/journeys/planner.spec.ts` | Single-user planner happy path |
| `e2e/journeys/aktivitas.spec.ts` | Aktivitas tab flow |
| `e2e/journeys/week-share.spec.ts` | Owner/partner share accept/revoke |
| `e2e/helpers/auth.ts` | Credentials + storageState |
| `e2e/helpers/partner-user.ts` | Partner credentials / upsert |

When adding product features, extend the matching journey or add a new journey file — don’t inflate smoke into a full product suite.
