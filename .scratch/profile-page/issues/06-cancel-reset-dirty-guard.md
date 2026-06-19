Status: completed

## What to build

Improve the profile form's UX around unsaved changes: add a "Reset" button that reverts fields to their original values, and warn users before they navigate away (close tab / refresh) with unsaved edits.

## Acceptance criteria

- [ ] A "Reset" button appears next to "Save changes" when `formState.isDirty` is `true`
- [ ] Clicking "Reset" calls `form.reset()`, restoring all fields to their original `defaultValues`
- [ ] A `beforeunload` event handler is active when the form is dirty, showing the browser's native unsaved-changes confirmation dialog
- [ ] Both features use `react-hook-form`'s `formState.isDirty` — no duplicate state tracking
- [ ] Type-check passes with zero new errors

## Blocked by

None - can start immediately
