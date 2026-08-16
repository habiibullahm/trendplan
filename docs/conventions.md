# Conventions (actions, auth, UI)

Short rules that keep new code consistent with the rest of TrendPlan.

## Server actions

- Mark files with `"use server"`.
- Return `ActionResult` (`actionSuccess` / `actionError` / field errors) — don’t leak stacks to the client.
- Validate with **zod** (`withValidation` or `safeParse`).
- Authorize before mutate (`gateAppUser`, ownership, or `weekPlanAccessWhere`).
- `revalidatePath` the screens that show the changed data; use `redirect` for post-success navigation when that’s the existing pattern.
- Rethrow Next control-flow errors (`unstable_rethrow` inside `withValidation`).

## Auth & sessions

- Product mutations: `requireAppUserAction` / `gateAppUser` (handles unverified / stale session).
- Prefer canonical `AUTH_URL` for links in mail; don’t invent host from untrusted headers.
- Email / verification features stay behind env flags until Resend domain is ready.

## Planner access

- Read/edit shared weeks through **viewer + ACL** helpers, not raw `weekPlan.userId === me` alone.
- Share admin (create/revoke invite): **owner only**.
- Partner seat: DB unique on `weekPlanId` + locked accept transaction.

## UI / UX

- Indonesian copy for user-facing strings.
- Prefer `getByRole` / labels in e2e; same accessibility mindset in components (`aria-*`, real buttons/links).
- Toast feedback for action success/error (`useActionToasts`).
- Avoid new card/dashboard chrome on marketing surfaces; inside the app, match existing planner/dashboard patterns.

## Testing defaults

- Unit: pure functions and schemas.
- E2E: smoke without auth; journeys with `storageState`.
- Don’t commit `.env.e2e` or `.auth/`.

## Related

- [App structure](app-structure.md)
- [How to add a feature](how-to-add-feature.md)
- [E2E guide](e2e-guide.md)
