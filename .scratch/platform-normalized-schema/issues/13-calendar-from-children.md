## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `components/dashboard/calendar-view.tsx` to display platform-specific data from child rows. Platform labels (LinkedIn/X) and scheduled dates sourced from `LinkedInPost` and `XPost` child rows.

## Acceptance criteria

- [ ] Calendar displays LinkedIn posts sourced from `LinkedInPost.scheduledAt`
- [ ] Calendar displays X posts sourced from `XPost.scheduledAt`
- [ ] Platform label shown per calendar event (LinkedIn or X)
- [ ] Clicking a calendar event navigates to correct platform context
- [ ] No references to `Post.linkedinScheduledAt` or `Post.xScheduledAt`

## Blocked by

`.scratch/platform-normalized-schema/issues/06-drafts-list-from-children.md`

Label: needs-triage