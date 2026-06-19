Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `POST /api/dashboard/saveDraft` to upsert `LinkedInPost` and `XPost` child rows on every save, instead of writing to the now-deleted `linkedinContent`/`xContent` columns on `Post`. The `Post` table becomes a pure metadata shell. Both child rows are created (or updated) with DRAFT status on every save. Remove all writes to `linkedinContent`/`xContent`.

## Acceptance criteria

- [x] `POST /api/dashboard/saveDraft` creates `LinkedInPost` row on first save with content from request body
- [x] `POST /api/dashboard/saveDraft` creates `XPost` row on first save with content/mode/threadPosts from request body
- [x] Both child rows created with `status = DRAFT`, `scheduledAt = null`
- [x] Subsequent saves update existing child rows (not create duplicates)
- [x] Unique constraint on `postId` enforced — one `LinkedInPost` and one `XPost` per `Post`
- [x] All writes to `Post.linkedinContent`/`Post.xContent` removed from the route
- [x] `clientDraftKey` uniqueness still enforced at `Post` level
- [x] Conflict detection (`updatedAt` check) still works
- [x] API returns `201` for new drafts, includes child row data in response
- [x] API returns 200 for existing drafts after update, includes child row data in response

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: completed

**Completed:** 2025-05-11 (verified 2025-05-11) - saveDraft API now uses child rows. Creates/updates LinkedInPost and XPost via upsert. Returns child data in response. TypeScript compiles.

## Agent Brief

**Category:** enhancement
**Summary:** Update saveDraft API to upsert LinkedInPost and XPost child rows instead of Post columns

**Current behavior:**
`POST /api/dashboard/saveDraft` writes to `Post.linkedinContent` and `Post.xContent` columns. These columns will be removed by issue 01.

**Desired behavior:**
- Upsert `LinkedInPost` row with content from request body on every save
- Upsert `XPost` row with content/mode/threadPosts from request body on every save
- Both children created with `status = DRAFT`, `scheduledAt = null` on first save
- Subsequent saves update existing children (not create duplicates)
- Response includes child row data

**Key interfaces:**
- `LinkedInPost` — new model with content, status, scheduledAt, postId
- `XPost` — new model with content, mode, threadPosts, status, scheduledAt, postId
- `saveDraft` route — now upserts children, not Post columns

**Acceptance criteria:**
- [ ] Creates LinkedInPost row on first save with content from request
- [ ] Creates XPost row on first save with content/mode/threadPosts
- [ ] Both children created with status=DRAFT, scheduledAt=null
- [ ] Subsequent saves update existing rows (no duplicates)
- [ ] Unique constraint on postId enforced
- [ ] All writes to Post.linkedinContent/xContent removed
- [ ] clientDraftKey uniqueness still enforced at Post level
- [ ] Conflict detection (updatedAt check) still works

**Out of scope:**
- Frontend changes (issue 12)
- Zod schema changes (issue 08)
