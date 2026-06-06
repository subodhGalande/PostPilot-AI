## What to build

Replace ~10 `any` type annotations in `components/` — specifically `calendar-view.tsx`, `drafts-grid.tsx`, `draft-editor-workspace.tsx`, `use-login-form.ts`, `use-signup-form.ts`, and `use-onboarding-form.ts` — using the same type patterns established in the server/lib layer fix.

## Acceptance criteria

- [x] 0 `noExplicitAny` violations in `components/`
- [ ] All existing functionality compiles and tests pass

## Blocked by

- #2 — type patterns established in lib layer

## Completion notes

Fixed 6 component files:

| File | Changes |
|------|---------|
| `calendar-view.tsx` | `content: any` → `content: unknown` in `CalendarEvent.extendedProps` (1 spot) |
| `draft-editor-workspace.tsx` | `draft: any` → `draft: SaveDraftResponse` (already imported) (1 spot) |
| `drafts-grid.tsx` | `(error as any).status` → `(error as { status: number }).status` (2 spots) |
| `use-login-form.ts` | `Promise<any>` → `Promise<{ message: string }>`; `error: any` → `error: Error` (2 spots) |
| `use-signup-form.ts` | `Promise<any>` → `Promise<{ message: string }>`; `error: any` → `error: Error` (2 spots) |
| `use-onboarding-form.ts` | `Promise<any>` → `Promise<unknown>` (1 spot) |

`biome check` confirms 0 `noExplicitAny` in `components/`. Remaining `noExplicitAny` are in `app/` (tracked in #4).
