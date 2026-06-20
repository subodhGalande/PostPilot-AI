Status: completed

## What to build

Add a live character counter to the description field on the profile editing form, so users know how much space remains.

## Acceptance criteria

- [ ] `description` in `lib/schemas/settings.schema.ts` has `.max(500)` added
- [ ] `components/profile/profile-form.tsx` shows `{currentLength}/500` below the textarea, updating on every keystroke
- [ ] Form validation rejects descriptions over 500 characters with an appropriate error message
- [ ] Type-check passes with zero new errors

## Blocked by

None - can start immediately
