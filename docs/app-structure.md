# App structure guide

Where code lives in TrendPlan (Next.js App Router). Use this for existing code and every new feature.

## Top-level map

```
src/
  app/                 # Routes only — thin pages, layouts, API routes
  features/            # Domain modules (one folder per product domain)
  components/          # Shared UI (Button, Modal, layout, theme)
  lib/                 # Cross-cutting infra (grouped by concern)
  generated/           # Prisma client (do not edit by hand)
prisma/                # schema + migrations
e2e/                   # Playwright smoke + journeys
docs/                  # Guides + user stories
```

## `app/` vs `features/` vs `lib/`

| Layer | Responsibility |
|-------|----------------|
| **`app/`** | URL segments, `page.tsx` / `layout.tsx`, load data, wire actions/components |
| **`features/<domain>/`** | Domain actions, components, lib — **not** routes |
| **`lib/`** | Shared infra used by **2+** features (auth gates, mail, prisma, week) |

Pages stay thin: gate → load → render feature components. Import from `@/features/...` and `@/lib/...`.

### Route groups

- `app/(app)/…` — logged-in product shell
- `app/demo/…` — read-only portfolio tour
- `app/api/…` — Route Handlers (cron, push, AI, clear-session)
- Auth / invite at root: `/login`, `/register`, `/onboarding`, `/invite/week`

---

## Canonical feature layout

**Every feature uses this shape** (folders even when there is only one file):

```
features/<name>/
  actions/                 # "use server" — always a directory
    index.ts               # OK for a single action module
    <topic>.ts             # split when the domain grows (e.g. content.ts, week-share.ts)
  components/              # UI for this domain only
  lib/                     # pure helpers + DB/orchestration
    *-pure.ts              # optional: no I/O, easy unit tests
    *.test.ts              # unit tests next to code
    *.integration.test.ts  # optional DB integration
  <subdomain>/             # optional (e.g. planner/ai/)
```

### Current domains

| Feature | `actions/` | Notes |
|---------|------------|--------|
| `auth` | `actions/*.ts` | login, password, profile, onboarding, … |
| `planner` | `content.ts`, `week-share.ts` | content CRUD + partner share |
| `activities` | `index.ts` | aktivitas tab |
| `feedback` | `index.ts` | saran form |
| `reminders` | — | no form actions; cron + `lib/` + toggle component |

### Rules

1. **Do not** add a root `features/<name>/actions.ts` next to an `actions/` folder.
2. Prefer **topic files** inside `actions/` once a feature has more than one concern.
3. **Mutations** live in `actions/`; **reads/orchestration** in `lib/`; **UI** in `components/`.
4. Cross-feature reuse → move shared bits to `src/lib/` (or a small shared feature), don’t deep-import another feature’s internals casually.
5. Demo: disable or stub mutating controls; don’t invent a parallel feature tree.

---

## Canonical `src/lib/` layout

Group by concern (same idea as features):

```
lib/
  auth/          # session, gates, tokens, validation, env
  errors/        # CodedError
  mail/          # sendMail + MailSendError
  result.ts      # domain Result<T, C> + resultOk/resultErr
  action-result.ts  # ActionResult base response + actionFail / errorCode
  *.ts           # small single-purpose shared modules (week, prisma, cn, …)
```

- New **multi-file** concerns → new folder (`lib/<concern>/`).
- Tiny one-offs may stay flat until a second related file appears, then group them.

---

## Shared UI

- Prefer `src/components/ui` + existing feature components.
- Brand tokens: `coral`, `paper`, `ink`.
- Toasts: Sonner + `useActionToasts` / `actionSuccess` / `actionError`.

## Data & auth

- Prisma: `prisma/schema.prisma` + `@/lib/prisma`.
- Mutations: `requireAppUserAction` / `gateAppUser` (not throwing `requireUserId` in new action code).
- Planner ACL: `weekPlanAccessWhere` / `getWeekPlanForViewer`.

## Tests & docs

| Kind | Location |
|------|----------|
| Unit | next to source (`*.test.ts`) |
| Integration | `*.integration.test.ts` |
| E2E | `e2e/` — [e2e-guide.md](e2e-guide.md) |
| User stories | `docs/user-stories/` |
| Eng guides | `docs/*.md` |

## Related

- [How to add a feature](how-to-add-feature.md)
- [Conventions](conventions.md)
- [E2E guide](e2e-guide.md)
