Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `DELETE /api/dashboard/drafts/[id]` to physical delete the target child row (`LinkedInPost` or `XPost`). If the other child row has no content, the cascade delete from `Post` removes the parent `Post` automatically. If the other child has content, `Post` is preserved.

## Acceptance criteria

- [x] `DELETE /api/dashboard/drafts/[id]?platform=linkedin` physically deletes the `LinkedInPost` row for that `Post`
- [x] `DELETE /api/dashboard/drafts/[id]?platform=x` physically deletes the `XPost` row for that `Post`
- [x] If the other child row has no content, `Post` is cascade-deleted
- [x] If the other child row has content, `Post` is preserved
- [x] `DELETE /api/dashboard/drafts/[id]` (no platform) still deletes the entire `Post` (cascade deletes both children)
- [x] Confirmation response indicates whether the entire `Post` was deleted or just the child row

## Blocked by

`.scratch/platform-normalized-schema/issues/02-save-draft-child-rows.md`

Label: completed

**Completed:** 2025-05-11 (verified 2025-05-11) - delete draft API now uses child rows. With platform param, deletes specific child row. If other child has no content, cascade deletes Post. Without platform, deletes entire Post. GET route also updated to use child rows. TypeScript compiles.

## Agent Brief

**Category:** enhancement
**Summary:** Update delete draft API to physically delete child rows, cascade delete Post if needed

**Current behavior:**
`DELETE /api/dashboard/drafts/[id]` deletes the entire Post row (and its columns).

**Desired behavior:**
- Delete specific child row when platform query param provided
- Cascade delete Post if other child has no content
- Preserve Post if other child has content
- Without platform param, delete entire Post (cascade both children)

**Key interfaces:**
- `DELETE /api/dashboard/drafts/[id]?platform=linkedin` — deletes LinkedInPost
- `DELETE /api/dashboard/drafts/[id]?platform=x` — deletes XPost

**Acceptance criteria:**
- [ ] platform=linkedin deletes LinkedInPost row
- [ ] platform=x deletes XPost row
- [ ] If other child has no content, Post cascade-deleted
- [ ] If other child has content, Post preserved
- [ ] No platform param still deletes entire Post
- [ ] Response indicates whether Post or child only was deleted
