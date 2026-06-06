## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `components/dashboard/post-preview.tsx` to render platform tabs based on which child rows have `status = DRAFT`. Scheduled children display as read-only. The platform badge status is derived from `LinkedInPost.status` and `XPost.status` instead of `Post` columns.

## Acceptance criteria

- [x] Platform tabs (LinkedIn, X) rendered only for children with `status = DRAFT`
- [x] Platform tab hidden when child has `status = SCHEDULED`
- [x] Platform badge shows DRAFT/SCHEDULED state sourced from child row `status`
- [x] Scheduled children display in read-only mode (no edit controls)
- [x] Schedule button labeled correctly based on child row `status`
- [x] No references to `Post.linkedinStatus` or `Post.xStatus`

## Blocked by

`.scratch/platform-normalized-schema/issues/09-reconstruct-post-from-children.md`

Label: completed

**Completed:** 2025-05-11 - Tabs rendered only when child status=DRAFT. Schedule button hidden for non-DRAFT children. Badge shows child row status.

## Agent Brief

**Category:** enhancement
**Summary:** Update post-preview to render tabs based on child row status, show read-only for scheduled

**Current behavior:**
Platform tabs render based on Post.linkedinStatus/xStatus.

**Desired behavior:**
- Render tabs only for children with status=DRAFT
- Hide tab when child has status=SCHEDULED
- Show DRAFT/SCHEDULED badge from child row status
- Display scheduled children in read-only mode

**Key interfaces:**
- `components/dashboard/post-preview.tsx` — tab rendering, badge display

**Acceptance criteria:**
- [ ] Tabs rendered only for children with status=DRAFT
- [ ] Tab hidden when child has status=SCHEDULED
- [ ] Badge shows DRAFT/SCHEDULED from child row
- [ ] Scheduled children read-only (no edit controls)
- [ ] Schedule button label correct based on child status
- [ ] No references to Post.linkedinStatus/xStatus