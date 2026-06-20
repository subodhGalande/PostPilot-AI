Status: completed

## What to build

Add an account deletion feature to the settings page: a "Danger Zone" card with a confirmation flow that permanently deletes the user's account and data, then redirects to the login page.

## Acceptance criteria

- [ ] New `DELETE /api/dashboard/settings/account` route handler:
  - Authenticates via `requireAuthJose()`
  - Deletes the authenticated user's record from Prisma (including cascaded drafts, posts, etc.)
  - Clears the `jwt` cookie to log the user out server-side
  - Returns `{ message: "Account deleted" }` with 200
- [ ] New `danger-section.tsx` component:
  - Red-bordered card (`border-destructive`) with heading "Delete Account"
  - Warning text explaining the action is permanent
  - A destructive `Button` opens a confirmation dialog
- [ ] Confirmation dialog (`<Dialog>` from shadcn):
  - Requires the user to type `DELETE` in a text input before enabling the confirm button
  - Confirm button is `variant="destructive"` and triggers the API call
  - On success, redirects to `/login`
- [ ] Danger zone renders at the bottom of the settings page, below Appearance
- [ ] Type-check passes with zero new errors

## Blocked by

HITL — Requires a decision on:
- Soft vs hard delete? (Hard delete is assumed here, but needs sign-off)
- Cascade to linked records (drafts, posts, analytics)?
- Add a data-export step before deletion? (Optional feature, may be a separate issue)

None - can start immediately from a code perspective once the HITL decision is made.
