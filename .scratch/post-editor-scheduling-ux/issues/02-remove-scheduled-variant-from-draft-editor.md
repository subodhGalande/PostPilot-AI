Status: ready-for-human

# Remove Scheduled Variant From Draft Editor

## What to build

After a user schedules one Platform Variant from the Draft editor, remove that scheduled variant from the draft-editing surface and continue the workflow on any remaining draft variant.

## Acceptance criteria

- [ ] After scheduling LinkedIn while X remains `DRAFT`, the LinkedIn tab disappears and X becomes active.
- [ ] After scheduling X while LinkedIn remains `DRAFT`, the X tab disappears and LinkedIn becomes active.
- [ ] The success toast identifies the scheduled platform and includes a way to view it in Calendar.
- [ ] The remaining draft variant stays editable and saveable without a full page refresh.

## Blocked by

- `.scratch/post-editor-scheduling-ux/issues/01-scope-save-draft-to-active-draft-variant.md`
