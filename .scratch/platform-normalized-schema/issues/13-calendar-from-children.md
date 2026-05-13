## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `components/dashboard/calendar-view.tsx` to display platform-specific data from child rows. Platform labels (LinkedIn/X) and scheduled dates sourced from `LinkedInPost` and `XPost` child rows.

## Acceptance criteria

- [x] Calendar displays LinkedIn posts sourced from `LinkedInPost.scheduledAt`
- [x] Calendar displays X posts sourced from `XPost.scheduledAt`
- [x] Platform label shown per calendar event (LinkedIn or X)
- [x] Clicking a calendar event navigates to correct platform context
- [x] No references to `Post.linkedinScheduledAt` or `Post.xScheduledAt`

## Blocked by

`.scratch/platform-normalized-schema/issues/06-drafts-list-from-children.md`

Label: completed

**Completed:** 2025-05-11 - `calendar-view.tsx` now uses `linkedinPost`/`xPost` from API. Events sourced from child row scheduledAt. Reschedule constructs post from child rows.

## Agent Brief

**Category:** enhancement
**Summary:** Update calendar to display platform data from child rows

**Current behavior:**
Calendar reads from `Post.linkedinScheduledAt`/`Post.xScheduledAt`.

**Desired behavior:**
- Display events from `LinkedInPost.scheduledAt` and `XPost.scheduledAt`
- Platform label per event (LinkedIn or X)
- Click navigates to correct platform context

**Key interfaces:**
- `components/dashboard/calendar-view.tsx` — event rendering from child rows

**Acceptance criteria:**
- [x] LinkedIn events from LinkedInPost.scheduledAt
- [x] X events from XPost.scheduledAt
- [x] Platform label shown per event
- [x] Click navigates to platform context
- [x] No Post column references