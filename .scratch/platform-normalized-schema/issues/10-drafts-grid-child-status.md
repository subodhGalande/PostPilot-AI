Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `components/dashboard/drafts-grid.tsx` to derive platform badges from child row status/existence instead of `linkedinStatus`/`xStatus` columns.

## Acceptance criteria

- [x] Platform badges (LinkedIn, X) shown based on presence and status of child rows
- [x] Badge state (draft/scheduled) derived from `LinkedInPost.status` and `XPost.status`
- [x] Grid renders correctly when one platform is scheduled and one is draft
- [x] No references to `Post.linkedinStatus` or `Post.xStatus`

## Blocked by

`.scratch/platform-normalized-schema/issues/07-draft-detail-from-children.md`

Label: completed

**Completed:** 2025-05-11 - `DraftListItem` now uses `linkedinPost`/`xPost` from child rows. Badges derived from `linkedinPost.status`/`xPost.status`. No Post column refs.

## Agent Brief

**Category:** enhancement
**Summary:** Update drafts-grid component to derive platform badges from child row status

**Current behavior:**
Platform badges in `components/dashboard/drafts-grid.tsx` read from Post.linkedinStatus/xStatus.

**Desired behavior:**
- Show LinkedIn badge based on LinkedInPost presence/status
- Show X badge based on XPost presence/status
- Badge shows DRAFT or SCHEDULED state

**Key interfaces:**
- `components/dashboard/drafts-grid.tsx` — platform badge rendering

**Acceptance criteria:**
- [ ] Platform badges shown based on child row presence/status
- [ ] Badge state derived from LinkedInPost.status and XPost.status
- [ ] Grid renders correctly when one platform scheduled, one draft
- [ ] No references to Post.linkedinStatus/xStatus
