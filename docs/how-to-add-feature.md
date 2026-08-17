# How to add a feature

Checklist for shipping a new capability using the **canonical** layout in [app-structure.md](app-structure.md).

## 1. Decide the domain

- **New product area** → `src/features/<name>/` with the full skeleton below.
- **Extension of an existing domain** → add under that feature’s `actions/`, `lib/`, `components/`.
- **Only a new URL** → thin `app/.../page.tsx` + existing feature imports.

Add a short user story under `docs/user-stories/` when behavior is non-obvious.

## 2. Scaffold (required shape)

```
features/<name>/
  actions/
    index.ts              # or <topic>.ts — "use server"
  components/
    <name>-panel.tsx
  lib/
    <name>.ts
    <name>.test.ts

app/(app)/<route>/page.tsx   # only if it needs its own screen
```

Never place `actions.ts` at the feature root. Always use `actions/`.

## 3. Data model (if needed)

1. Edit `prisma/schema.prisma`.
2. Add `prisma/migrations/…`.
3. Prefer DB constraints for race-sensitive rules (uniques, FKs).

## 4. Domain logic

- Pure helpers: `lib/*-pure.ts` (unit-test friendly).
- DB/orchestration: `lib/*.ts` (`"server-only"` when appropriate).
- Reuse `@/lib/auth`, `@/lib/mail`, rate limits, ACL helpers — don’t reinvent.

## 5. Server actions

```ts
"use server";
// requireAppUserAction → validate → authorize → mutate → revalidatePath / redirect
```

Copy patterns from:

- `features/feedback/actions` — `withValidation` + `ActionResult`
- `features/planner/actions/week-share` — coded errors, soft auth fail
- Prefer Server Actions for forms; Route Handlers under `app/api/` for cron/webhooks/non-form clients

Never trust client ids without ownership/ACL checks. Don’t throw raw `Unauthorized` from actions — return `ActionResult`.

**Results / errors (structure):**

- **`ActionResult`** (`src/lib/action-result.ts`) — base client-facing server-action response for `useActionState` / Sonner across **all features**. Prefer `actionFail(errorCode)` / `actionErrorCode` / `actionSuccess`. Optional **`errorCode`** is the machine-stable failure id; UI may keep reading `error` / `success` only. Field-only validation uses `errorCode: "validation"` **without** an `error` string (no toast).
- **`Result<T, C>`** (`src/lib/result.ts`) — domain lib union (`{ ok: true } & T` | `{ ok: false; code }`). Domain failures use **`code`** (not `errorCode`). Prefer `resultOk` / `resultErr`. Used by week-share create/accept today.
- **`CodedError`** (`src/lib/errors/coded-error.ts`) — throw-only boundaries (e.g. `MailSendError` from `sendMail`). Actions catch and map to `actionFail` / message maps; never leak provider/stack text to the client.

## 6. UI

1. Components under `features/<name>/components/`.
2. Wire from a thin page.
3. Indonesian copy; existing Button/Modal/FormField.
4. Demo (`/demo`) stays read-only for mutating controls.

## 7. Tests

| Change | Prefer |
|--------|--------|
| Pure / schemas | Unit next to file |
| ACL / transactions | Integration test |
| Critical journey | `e2e/journeys/<name>.spec.ts` — [e2e-guide.md](e2e-guide.md) |

One journey file per heavy fixture (don’t dump multi-user share into planner smoke).

## 8. Config & docs

- Env → `.env.example` (+ `.env.e2e.example` if needed).
- Flags → `*_ENABLED` pattern.
- Shared multi-file infra → `src/lib/<concern>/` (see app-structure).

## 9. In-app update log (user-visible features)

1. Bump `package.json` version.
2. Prepend `UPDATE_LOG` in `src/lib/updates.ts`.
3. Keep `updates.test.ts` green.

## Related

- [App structure](app-structure.md)
- [Conventions](conventions.md)
- [E2E guide](e2e-guide.md)
