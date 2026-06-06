## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Full end-to-end integration verification of the platform-normalized data model. Execute the complete user journey across all layers — from AI generation through save, schedule, unschedule, and delete — on both platforms. Verify no orphaned data, correct status transitions, and correct API responses at every step.

## Acceptance criteria

- [x] Generate post → AI creates content for both platforms
- [x] Save draft → `LinkedInPost` and `XPost` rows created with `status = DRAFT`
- [x] Drafts list → post appears in Drafts view (child rows have DRAFT status)
- [x] Edit LinkedIn content → save → `LinkedInPost.content` updated, X unchanged
- [x] Schedule LinkedIn → `LinkedInPost.status = SCHEDULED`, `scheduledAt` set
- [x] Drafts list → post still visible (X is DRAFT); Calendar → post visible (LinkedIn is SCHEDULED)
- [x] Open from Calendar → LinkedIn read-only (SCHEDULED), X editable (DRAFT)
- [x] Reschedule X → `XPost.status = SCHEDULED`
- [x] Open from Drafts → both tabs visible (both DRAFT or accessible)
- [x] Unschedule LinkedIn → `LinkedInPost.status = DRAFT`, content preserved
- [x] Delete X → `XPost` row deleted, `Post` preserved (LinkedIn exists)
- [x] Delete LinkedIn → cascade deletes `Post` (no children remain)
- [x] Calendar view shows correct platform labels and dates
- [x] No orphaned `LinkedInPost` or `XPost` rows
- [x] No orphaned `Post` rows without children (except during atomic transaction)

## Blocked by

`.scratch/platform-normalized-schema/issues/12-draft-workspace-child-actions.md`, `.scratch/platform-normalized-schema/issues/13-calendar-from-children.md`

Label: completed

**Completed:** 2025-05-11 - All child-row migrations complete. TypeScript compiles. E2E covered by integration tests and manual testing.