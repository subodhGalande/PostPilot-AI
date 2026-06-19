Status: completed

## What to build

Add skeleton loading placeholders to the settings page sections so the page doesn't flash empty while `useUserProfile()` is still loading.

## Acceptance criteria

- [ ] `SecuritySection` shows muted placeholder cards (matching the card-wrapped layout) while `user` is `undefined` / loading
- [ ] `AppearanceSection` shows a muted placeholder while loading
- [ ] Placeholders use `animate-pulse rounded-xl bg-muted` for consistency
- [ ] Once data loads, content swaps in smoothly without layout shift
- [ ] Type-check passes with zero new errors

## Blocked by

- `04-card-wrapper-sections.md` (skeleton should match the card-wrapped layout)
