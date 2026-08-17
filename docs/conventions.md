# Conventions (actions, auth, UI)

Short rules that keep new code consistent with the rest of TrendPlan. Folder layout: [app-structure.md](app-structure.md).

## Feature folders

- Always `actions/` (directory), `components/`, `lib/`.
- Split action files by topic when a domain grows (`content.ts`, `week-share.ts`).
- Shared multi-file infra goes under `src/lib/<concern>/` (`auth/`, `mail/`, `errors/`).

## Server actions

- Mark files with `"use server"`.
- Gate with `requireAppUserAction` (return `ActionResult` — don’t throw `Unauthorized`).
- Return `ActionResult` (`status` / `message` / `data` via `actionSuccess` / `actionFail` / `actionErrorCode`) — don’t leak stacks.
- `useActionState` idle seed: `idleActionResult`. Treat completed success as `isCompletedActionSuccess` (needs `message`), not bare `status === "success"`.
- Validate with **zod** (`withValidation` or `safeParse`).
- Authorize before mutate (ownership or `weekPlanAccessWhere`).
- `revalidatePath` screens that show the change; `redirect` when that’s the existing pattern.
- Rethrow Next control-flow errors (`unstable_rethrow` inside `withValidation`).

## Auth & sessions

- Product mutations: `requireAppUserAction` / `gateAppUser`.
- Prefer canonical `AUTH_URL` for links in mail.
- Email / verification stay behind env flags until Resend domain is ready.

## Planner access

- Read/edit shared weeks through viewer + ACL helpers, not raw `weekPlan.userId === me` alone.
- Share admin (create/revoke invite): **owner only**.
- Partner seat: DB unique on `weekPlanId` + locked accept transaction.

## UI / UX

- Indonesian copy for user-facing strings.
- Prefer `getByRole` / labels in e2e; accessible components (`aria-*`, real buttons/links).
- Toast feedback for action success/error (`useActionToasts`).
- Match existing planner/dashboard patterns inside the app.

## Testing defaults

- Unit: pure functions and schemas next to source.
- E2E: smoke without auth; journeys with `storageState`.
- Don’t commit `.env.e2e` or `.auth/`.

## Related

- [App structure](app-structure.md)
- [How to add a feature](how-to-add-feature.md)
- [E2E guide](e2e-guide.md)
