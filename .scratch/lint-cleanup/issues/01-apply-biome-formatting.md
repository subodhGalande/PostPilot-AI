## What to build

Run `biome format --write` across the entire codebase to fix formatting inconsistencies in ~113 files. Biome enforces space indentation (2 spaces), consistent quotes, trailing commas, and object formatting. No logic changes — pure style alignment.

## Acceptance criteria

- [x] `npx biome check` produces 0 formatting diffs
- [x] All 113+ formatting warnings are resolved
- [ ] CI lint step passes (blocked by remaining linter issues #2-#10)

## Blocked by

None - can start immediately

## Completion notes

Ran `npm run format` (biome format --write). Fixed 113 files. `biome check` confirms 0 formatting diffs. Remaining violations are all linter rules tracked in issues 2–10.
