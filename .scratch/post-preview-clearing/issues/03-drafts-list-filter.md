Status: completed

# Drafts list: filter by DRAFT status + indicators


## Parent

`.scratch/post-preview-clearing/PRD.md`

## What to build

Update the Drafts list to filter posts, showing only those with at least one platform variant in DRAFT status. Update card platform indicators to show only for platforms that are DRAFT (not SCHEDULED, PUBLISHED, etc.). Scheduled-only posts (where both platforms are not DRAFT) should not appear in Drafts list.

## Acceptance criteria

- [ ] Drafts list shows only posts where linkedinStatus = 'DRAFT' OR xStatus = 'DRAFT'
- [ ] Card shows LinkedIn indicator only if LinkedIn platform is DRAFT
- [ ] Card shows X indicator only if X platform is DRAFT
- [ ] Posts where both platforms are SCHEDULED do not appear in Drafts list
- [ ] Unschedule from Calendar correctly adds post back to Drafts list when at least one platform becomes DRAFT

## Blocked by

None - can start immediately
