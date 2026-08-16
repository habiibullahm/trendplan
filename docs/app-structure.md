# App structure guide

Where code lives in TrendPlan (Next.js App Router). Use this when navigating or placing new work.

## Top-level map

```
src/
  app/                 # Routes only — thin pages, layouts, API routes
  features/            # Domain modules (auth, planner, activities, …)
  components/          # Shared UI (Button, Modal, layout, theme)
  lib/                 # Cross-cutting helpers (prisma, auth gates, mail, week)
  generated/           # Prisma client (do not edit by hand)
prisma/                # schema + migrations
e2e/                   # Playwright smoke + journeys
docs/                  # Guides + user stories
```

## `app/` vs `features/`

| Layer | Responsibility |
|-------|----------------|
| **`app/`** | URL segments, `page.tsx` / `layout.tsx`, load data, wire actions/components |
| **`features/<domain>/`** | Business logic, server actions, domain components, feature-local libs |
| **`lib/`** | Shared infra used by several features (DB, session, rate limit, labels) |

Pages stay thin: auth/gate → load → render feature components. Prefer importing from `@/features/...` and `@/lib/...`.

### Route groups (examples)

- `app/(app)/…` — logged-in product shell (dashboard, planner, akun, …)
- `app/demo/…` — read-only portfolio tour
- `app/api/…` — Route Handlers (cron, clear-session, AI caption, …)
- Auth pages at root: `/login`, `/register`, `/onboarding`, `/invite/week`

## Feature folder shape

Typical feature layout:

```
features/<name>/
  actions.ts           # or actions/*.ts — "use server"
  components/          # client or server UI for this domain
  lib/                 # domain logic (pure helpers + DB orchestration)
  lib/*.test.ts        # unit tests next to code
  ai/                  # optional subdomain (planner AI assist)
```

Existing domains: `auth`, `planner`, `activities`, `reminders`, `feedback`.

## Shared UI

- Prefer existing wrappers in `src/components/ui` and feature components before inventing new primitives.
- Brand tokens: `coral`, `paper`, `ink` (see Tailwind / shadcn CSS variables).
- Toasts via Sonner + `useActionToasts` / action success helpers.

## Data & auth

- **Prisma** models in `prisma/schema.prisma`; access via `@/lib/prisma`.
- **Session**: Auth.js JWT — use `gateAppUser` / `requireAppUserAction` for mutations; `getSafeSession` / `auth()` for reads as elsewhere.
- **Planner ACL**: owner or partner via `weekPlanAccessWhere` / `getWeekPlanForViewer` (`features/planner/lib/week-share.ts`).

## Tests & docs

| Kind | Location |
|------|----------|
| Unit | `src/**/*.test.ts` (`npm test`) |
| Integration (DB) | e.g. `*.integration.test.ts` |
| E2E | `e2e/` — see [e2e-guide.md](e2e-guide.md) |
| User stories | `docs/user-stories/` |
| Eng guides | `docs/*.md` (this file, add-feature, e2e) |

## Related

- [How to add a feature](how-to-add-feature.md)
- [E2E guide](e2e-guide.md)
