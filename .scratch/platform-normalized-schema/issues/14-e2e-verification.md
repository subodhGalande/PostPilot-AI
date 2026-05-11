## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Full end-to-end integration verification of the platform-normalized data model. Execute the complete user journey across all layers — from AI generation through save, schedule, unschedule, and delete — on both platforms. Verify no orphaned data, correct status transitions, and correct API responses at every step.

## Acceptance criteria

- [ ] Generate post → AI creates content for both platforms
- [ ] Save draft → `LinkedInPost` and `XPost` rows created with `status = DRAFT`
- [ ] Drafts list → post appears in Drafts view (child rows have DRAFT status)
- [ ] Edit LinkedIn content → save → `LinkedInPost.content` updated, X unchanged
- [ ] Schedule LinkedIn → `LinkedInPost.status = SCHEDULED`, `scheduledAt` set
- [ ] Drafts list → post still visible (X is DRAFT); Calendar → post visible (LinkedIn is SCHEDULED)
- [ ] Open from Calendar → LinkedIn read-only (SCHEDULED), X editable (DRAFT)
- [ ] Reschedule X → `XPost.status = SCHEDULED`
- [ ] Open from Drafts → both tabs visible (both DRAFT or accessible)
- [ ] Unschedule LinkedIn → `LinkedInPost.status = DRAFT`, content preserved
- [ ] Delete X → `XPost` row deleted, `Post` preserved (LinkedIn exists)
- [ ] Delete LinkedIn → cascade deletes `Post` (no children remain)
- [ ] Calendar view shows correct platform labels and dates
- [ ] No orphaned `LinkedInPost` or `XPost` rows
- [ ] No orphaned `Post` rows without children (except during atomic transaction)

## Blocked by

`.scratch/platform-normalized-schema/issues/12-draft-workspace-child-actions.md`, `.scratch/platform-normalized-schema/issues/13-calendar-from-children.md`

Label: needs-triage