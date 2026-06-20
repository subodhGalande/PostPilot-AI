Status: completed

## What to build

After a successful password change, automatically redirect the user to the login page with a `reason=password-changed` query parameter so they know to sign in with their new password.

## Acceptance criteria

- [ ] The `PATCH /api/dashboard/settings/password` handler remains unchanged — success response is the trigger
- [ ] The `SecurityForm` component calls `window.location.href = "/login?reason=password-changed"` after `passwordMutation.isSuccess` becomes `true`
- [ ] Type-check passes with zero new errors

## Blocked by

None - can start immediately
