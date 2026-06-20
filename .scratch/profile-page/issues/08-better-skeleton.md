Status: completed

## What to build

Replace the current single muted-bar skeleton with a layout-matched placeholder that shows the avatar circle, user-info text lines, and form card with field rows — reducing perceived layout shift on load.

## Acceptance criteria

- [ ] The skeleton layout mirrors the loaded page shape: a circular avatar placeholder, two text-line placeholders beside it, and a card placeholder with 5 field-row placeholders
- [ ] All placeholders use the existing `animate-pulse rounded-xl bg-muted` classes for consistency
- [ ] The skeleton is a separate component (`ProfilePageSkeleton`) — no inline duplication
- [ ] Type-check passes with zero new errors

## Blocked by

None - can start immediately
