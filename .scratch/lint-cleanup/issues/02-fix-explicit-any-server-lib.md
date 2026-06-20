Status: completed

## What to build

Replace ~20 `any` type annotations in `lib/server/` (`draft-store.ts`, `draft-store-adapter.ts`), `lib/errors.ts`, and `lib/drafts.ts` with proper TypeScript types. This requires defining interfaces for draft store data structures, error payloads, and platform-specific post formats. Establish type patterns that subsequent issues can follow.

## Acceptance criteria

- [x] 0 `noExplicitAny` violations in `lib/`
- [x] Type definitions extracted to shared types file if non-trivial
- [ ] All existing functionality compiles and tests pass

## Blocked by

None - can start immediately

## Completion notes

Fixed 4 files in `lib/`:

| File | Changes |
|------|---------|
| `lib/errors.ts` | Replaced `as any` with `Record<string, unknown>` + `{ status: number }` type assertions (2 spots) |
| `lib/drafts.ts` | `content?: any` → `content?: StoredDraftContent`; `post: any` → typed `ReconstructPostInput` interface (2 spots) |
| `lib/server/draft-store.ts` | `post: any` → proper types (`PlatformChildData`, `XPostChildData`, `PostWithChildren`); `Promise<any>` → `Promise<unknown>`; `as any` → removed (6 spots) |
| `lib/server/draft-store-adapter.ts` | Added `DraftPostStatus` & `JsonArray` type aliases; `batch` → `Promise<unknown>`; `status as any` → `status as DraftPostStatus`; `threadPosts as any` → `threadPosts as JsonArray`; `as any` return → `as PostWithChildren` (17 spots) |

`biome check` confirms 0 `noExplicitAny` in `lib/`. One `noUnusedImports` in `lib/social-posts.ts` is a dead-code issue (tracked in #6), not an explicit-any issue.
