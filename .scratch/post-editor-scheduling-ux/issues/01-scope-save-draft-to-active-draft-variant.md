Status: ready-for-human

# Scope Save Draft to Active Draft Variant

## What to build

Make the post editor save action explicitly target only the active `DRAFT` Platform Variant. The button label and behavior should make it clear that saving a draft never mutates a scheduled Platform Variant.

## Acceptance criteria

- [ ] When LinkedIn is the active draft variant, the save button reads `Save LinkedIn Draft`.
- [ ] When X is the active draft variant, the save button reads `Save X Draft`.
- [ ] Scheduled Platform Variants are not affected by saving the active draft variant.
- [ ] The save action remains disabled only for existing save/generation pending states, not merely because another Platform Variant is scheduled.

## Blocked by

None - can start immediately
