Status: completed

## What to build

Build the Security section for credential-based accounts: a PATCH endpoint that validates the current password with argon2 and hashes a new one, a Zod schema for the form, and a section component rendered only when the user's provider is CREDENTIALS (hidden entirely for GOOGLE users).

The security section shows a form with current password, new password, and confirm new password fields. If the current password is wrong, the API returns 401 and the form shows an error. Failed attempts are rate-limited.

## Acceptance criteria

- [ ] The Security section appears on the settings page only when `user.provider === "CREDENTIALS"`
- [ ] The Security section is completely hidden for GOOGLE-authenticated users
- [ ] `PATCH /api/dashboard/settings/password` accepts `{ currentPassword, newPassword }` and validates the current password against the stored argon2 hash
- [ ] Submitting with an incorrect current password shows "Current password is incorrect" and does not change the password
- [ ] Submitting with valid credentials updates the password in the database
- [ ] The new password follows the same strength rules as signup (8+ chars, uppercase, lowercase, digit, special char)
- [ ] Form field validation errors appear inline (matching passwords, password strength)
- [ ] The form fields clear on success, and a success toast is shown
- [ ] Rate limiting returns 429 after multiple failed attempts within a window

## Blocked by

- [01-settings-shell-appearance](./01-settings-shell-appearance.md) — needs the settings page shell to exist
