Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `POST /api/dashboard/schedulePost` to flip the target child row `status` to SCHEDULED and set `scheduledAt`. Removes all writes to the now-deleted `linkedinStatus`/`xStatus`/`linkedinScheduledAt`/`xScheduledAt` columns. Creates child rows if they don't exist (legacy edge case — post was created before this refactor).

## Acceptance criteria

- [x] `POST /api/dashboard/schedulePost` sets `LinkedInPost.status = SCHEDULED` and `LinkedInPost.scheduledAt` when `platform = linkedin`
- [x] `POST /api/dashboard/schedulePost` sets `XPost.status = SCHEDULED` and `XPost.scheduledAt` when `platform = x`
- [x] Non-target child row is left untouched (preserves its status/scheduledAt)
- [x] If target child row does not exist (legacy post), it is created with SCHEDULED status
- [x] All writes to `Post.linkedinStatus`/`Post.xStatus`/`Post.linkedinScheduledAt`/`Post.xScheduledAt` removed
- [x] Conflict detection (`updatedAt` check) still works
- [x] Response includes updated child row data

## Blocked by

`.scratch/platform-normalized-schema/issues/02-save-draft-child-rows.md`

Label: completed

**Completed:** 2025-05-11 (verified 2025-05-11) - schedulePost now targets child rows. Sets status=SCHEDULED and scheduledAt on LinkedInPost/XPost. Creates child rows if missing (legacy). Returns child data in response. TypeScript compiles.

## Agent Brief

**Category:** enhancement
**Summary:** Update schedulePost API to target child row status instead of Post columns

**Current behavior:**
`POST /api/dashboard/schedulePost` writes to `Post.linkedinStatus`/`Post.xStatus` and `Post.linkedinScheduledAt`/`Post.xScheduledAt`. These columns will be removed.

**Desired behavior:**
- Set `LinkedInPost.status = SCHEDULED` and `LinkedInPost.scheduledAt` when platform=linkedin
- Set `XPost.status = SCHEDULED` and `XPost.scheduledAt` when platform=x
- Non-target child row preserved (not modified)
- Creates child row if missing (legacy edge case)

**Key interfaces:**
- `schedulePost` route — targets child row status, not Post columns

**Acceptance criteria:**
- [ ] Sets LinkedInPost.status=SCHEDULED and scheduledAt when platform=linkedin
- [ ] Sets XPost.status=SCHEDULED and scheduledAt when platform=x
- [ ] Non-target child row untouched
- [ ] Creates child with SCHEDULED if missing (legacy)
- [ ] All writes to Post.linkedinStatus/xStatus/linkedinScheduledAt/xScheduledAt removed
- [ ] Conflict detection still works
- [ ] Response includes updated child row data
