## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `components/dashboard/draft-editor-workspace.tsx` to target child row mutations for save, schedule, unschedule, and delete actions. Status badges and state management derived from child row `status` fields. Save mutation sends content that maps to child rows. Delete mutation targets specific child row.

## Acceptance criteria

- [ ] Save mutation sends `post.linkedin.content` and `post.x.posts` to child row upsert
- [ ] Schedule mutation targets child row `status` = SCHEDULED
- [ ] Unschedule mutation targets child row `status` = DRAFT (row persists)
- [ ] Delete mutation targets specific child row for deletion
- [ ] Platform action menu (unschedule/delete) targets correct child row
- [ ] `currentLinkedinStatus` and `currentXStatus` sourced from child row response
- [ ] `onScheduleSuccess` handler updates child row derived state
- [ ] Redirect logic after schedule/unschedule works with child row response
- [ ] Confirmation modal text reflects child row deletion

## Blocked by

`.scratch/platform-normalized-schema/issues/02-save-draft-child-rows.md`, `.scratch/platform-normalized-schema/issues/03-schedule-post-child-rows.md`, `.scratch/platform-normalized-schema/issues/04-unschedule-post-child-rows.md`, `.scratch/platform-normalized-schema/issues/05-delete-draft-child-row.md`

Label: needs-triage