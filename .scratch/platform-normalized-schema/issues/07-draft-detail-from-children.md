Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `GET /api/dashboard/drafts/[id]` to include `linkedinPost` and `xPost` objects in the response, sourced from the new child tables. Status is derived from child rows.

## Acceptance criteria

- [x] Response includes `linkedinPost` object: `{ id, content, status, scheduledAt }`
- [x] Response includes `xPost` object: `{ id, content, mode, threadPosts, status, scheduledAt }`
- [x] Status fields (`linkedinStatus`, `xStatus`) sourced from child row `status` field
- [x] `reconstructPostContent` can build `StoredDraftContent` from the new response shape
- [x] Returns 404 if `Post` not found or doesn't belong to user
- [x] Works for both DRAFT and SCHEDULED children

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: completed

**Completed:** 2025-05-11 - `GET /api/dashboard/drafts/[id]` now includes `linkedinPost` and `xPost` via `include`. Status derived from child rows. Works with reconstructed content.

## Agent Brief

**Category:** enhancement
**Summary:** Update draft detail API to include child rows in response, derive status from children

**Current behavior:**
`GET /api/dashboard/drafts/[id]` returns Post columns for platform status.

**Desired behavior:**
- Response includes linkedinPost: { id, content, status, scheduledAt }
- Response includes xPost: { id, content, mode, threadPosts, status, scheduledAt }
- Status sourced from child row status field

**Key interfaces:**
- `GET /api/dashboard/drafts/[id]` — include child rows in response

**Acceptance criteria:**
- [ ] Response includes linkedinPost object
- [ ] Response includes xPost object
- [ ] Status from child row status field
- [ ] reconstructPostContent can build StoredDraftContent
- [ ] Returns 404 if Post not found or wrong user
