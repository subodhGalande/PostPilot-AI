Status: completed

## What to build

When a Google-authenticated user visits the settings page, show an informational message explaining that password management is not available ("Signed in with Google. No password required.") instead of rendering nothing.

## Acceptance criteria

- [ ] `SecuritySection` checks `user.provider` and renders an info banner for `"GOOGLE"` users instead of returning `null`
- [ ] The banner uses a neutral/blue background (not an error style) with an icon (e.g. `BadgeCheck` or `Info`)
- [ ] The banner text reads: "You're signed in with Google. No password required."
- [ ] Type-check passes with zero new errors

## Blocked by

- `04-card-wrapper-sections.md` (recommended but not strictly required — the card wrapper ensures visual consistency)
