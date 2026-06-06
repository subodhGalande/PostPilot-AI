Status: ready-for-human

# Redirect When All Variants Scheduled

## What to build

When the user schedules the final remaining `DRAFT` Platform Variant, complete the draft workflow by sending the user to Calendar, where scheduled Platform Variants live.

## Acceptance criteria

- [ ] If no Platform Variant remains in `DRAFT` after scheduling, the user is redirected to Calendar.
- [ ] The newly scheduled Platform Variant appears in Calendar after redirect.
- [ ] The fully scheduled Draft no longer appears in the Drafts list.
- [ ] The user does not see an empty editable Draft editor after final scheduling.

## Blocked by

- `.scratch/post-editor-scheduling-ux/issues/02-remove-scheduled-variant-from-draft-editor.md`
