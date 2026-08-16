# How to add a feature

Checklist for shipping a new capability in TrendPlan without fighting existing conventions.

## 1. Decide the domain

- **New product area** → new folder under `src/features/<name>/`.
- **Extension of planner/auth/…** → add under that feature (`lib/`, `actions/`, `components/`).
- **Only a new URL** that reuses existing logic → thin `app/.../page.tsx` + existing feature imports.

Write a short user story under `docs/user-stories/` when the behavior is non-obvious (see partner week share).

## 2. Data model (if needed)

1. Edit `prisma/schema.prisma`.
2. Add a migration (`prisma/migrations/…`).
3. Run migrate locally; keep deploy path (`db:deploy`) in mind for Vercel.

Prefer constraints in the DB (uniques, FKs) for rules that must never race — e.g. one partner seat per week.

## 3. Domain logic

- Put **pure** helpers in `features/<name>/lib/*-pure.ts` (easy unit tests).
- Put DB/orchestration in `lib/*.ts` with `"server-only"` when appropriate.
- Reuse shared gates: `gateAppUser`, `weekPlanAccessWhere`, `appBaseUrl`, rate limits.

## 4. Server actions / API

Mutations that forms call:

```ts
"use server";
// validate (zod + withValidation) → authorize → mutate → revalidatePath / redirect
```

Patterns to copy:

- `withValidation` + `ActionResult` / `actionError` / `actionSuccess`
- Rate limits via `assertRateLimits` / `checkRateLimit` for sensitive endpoints
- Catch Prisma `P2002` when uniques matter to UX
- Prefer Server Actions for form flows; Route Handlers for cron, webhooks, or non-form clients (`app/api/…`)

Never trust client-sent ids without an ownership/ACL check.

## 5. UI

1. Add components under `features/<name>/components/`.
2. Wire them from a thin `app/(app)/…/page.tsx` (or extend an existing page).
3. Use existing Button/Modal/FormField patterns; keep Indonesian copy consistent with the rest of the app.
4. Demo surfaces (`/demo`) stay read-only — disable or stub mutating controls.

## 6. Tests

| Change | Prefer |
|--------|--------|
| Pure logic / schemas | Unit next to file |
| ACL, transactions, invites | Integration or focused unit with mocked prisma only if needed |
| Critical UI journey | E2E journey under `e2e/journeys/` — see [e2e-guide.md](e2e-guide.md) |

Do not put multi-user / heavy setup into unrelated journeys (e.g. week-share ≠ planner smoke).

## 7. Config & docs

- New env vars → `.env.example` (+ `.env.e2e.example` if e2e needs them).
- Feature flags: follow existing `*_ENABLED` patterns (email, AI assist).
- Link user story / eng notes from README only when the feature is user-visible or ops-critical.

## Minimal skeleton

```
features/my-feature/
  actions.ts
  lib/my-feature.ts
  lib/my-feature.test.ts
  components/my-feature-panel.tsx

app/(app)/my-feature/page.tsx   # if it needs its own route
```

## Related

- [App structure](app-structure.md)
- [E2E guide](e2e-guide.md)
