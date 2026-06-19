Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `POST /api/dashboard/unschedulePost` to flip the target child row `status` to DRAFT and null `scheduledAt`. The child row is NOT deleted — it persists. Removes all writes to the now-deleted `linkedinStatus`/`xStatus`/`linkedinScheduledAt`/`xScheduledAt` columns.

## Acceptance criteria

- [x] `POST /api/dashboard/unschedulePost` sets `LinkedInPost.status = DRAFT` and `LinkedInPost.scheduledAt = null` when `platform = linkedin`
- [x] `POST /api/dashboard/unschedulePost` sets `XPost.status = DRAFT` and `XPost.scheduledAt = null` when `platform = x`
- [x] Non-target child row is left untouched
- [x] Child row is NOT deleted — row persists after unschedule
- [x] All writes to `Post.linkedinStatus`/`Post.xStatus`/`Post.linkedinScheduledAt`/`Post.xScheduledAt` removed
- [x] Response includes updated child row data

## Blocked by

`.scratch/platform-normalized-schema/issues/02-save-draft-child-rows.md`

Label: completed

**Completed:** 2025-05-11 (verified 2025-05-11) - unschedulePost now targets child rows. Sets status=DRAFT and scheduledAt=null on LinkedInPost/XPost. Child row persists (not deleted). Returns child data in response. TypeScript compiles.

## Agent Brief

**Category:** enhancement
**Summary:** Update unschedulePost API to target child row status instead of Post columns

**Current behavior:**
`POST /api/dashboard/unschedulePost` writes to `Post.linkedinStatus`/`Post.xStatus` and `Post.linkedinScheduledAt`/`Post.xScheduledAt`.

**Desired behavior:**
- Set `LinkedInPost.status = DRAFT` and null `scheduledAt` when platform=linkedin
- Set `XPost.status = DRAFT` and null `scheduledAt` when platform=x
- Child row persists (not deleted)

**Key interfaces:**
- `unschedulePost` route — targets child row status, not Post columns

**Acceptance criteria:**
- [ ] Sets LinkedInPost.status=DRAFT, scheduledAt=null when platform=linkedin
- [ ] Sets XPost.status=DRAFT, scheduledAt=null when platform=x
- [ ] Non-target child row untouched
- [ ] Child row persists after unschedule (not deleted)
- [ ] All writes to Post.linkedinStatus/xStatus/linkedinScheduledAt/xScheduledAt removed
- [ ] Response includes updated child row data
