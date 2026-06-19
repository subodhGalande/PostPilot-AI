Status: completed

# PostPreview: platform param + debounce


## Parent

`.scratch/post-preview-clearing/PRD.md`

## What to build

Update the PostPreview component's `onSaveDraft` callback to accept a `platform` parameter ("linkedin" | "x"), indicating which platform variant was saved. Add 500ms debounce to the save button to prevent duplicate requests on rapid clicks.

## Acceptance criteria

- [ ] `onSaveDraft` callback receives `platform: "linkedin" | "x"` parameter
- [ ] Dashboard's save handler receives platform info
- [ ] Save button disabled during 500ms debounce window
- [ ] Save button disabled while save request is pending (existing behavior)
- [ ] No regression in existing PostPreview functionality

## Blocked by

None - can start immediately
