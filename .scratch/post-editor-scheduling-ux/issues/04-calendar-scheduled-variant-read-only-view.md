Status: ready-for-human

# Calendar Scheduled Variant Read-Only View

## What to build

When a scheduled Platform Variant is opened from Calendar, show that exact variant in a read-only management view with scheduling actions instead of draft-editing controls.

## Acceptance criteria

- [ ] Opening a scheduled LinkedIn event from Calendar shows LinkedIn content in read-only mode.
- [ ] Opening a scheduled X event from Calendar shows X content in read-only mode.
- [ ] The view shows scheduled-state actions: `Reschedule`, `Unschedule`, and `Delete`.
- [ ] The view does not show `Save as Draft` or platform draft save controls.
- [ ] Unscheduling moves the Platform Variant back to the Draft editor as editable draft content.

## Blocked by

- `.scratch/post-editor-scheduling-ux/issues/02-remove-scheduled-variant-from-draft-editor.md`
