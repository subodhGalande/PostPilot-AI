Status: completed

# Dashboard: clear platform on save + sessionStorage


## Parent

`.scratch/post-preview-clearing/PRD.md`

## What to build

Update the dashboard page's save handler to clear the operated platform from the generatedPostPack. The other platform variant stays visible if it has content. When both platforms are cleared, reset to "Ready to Write" state and clear sessionStorage. On single platform clear, update sessionStorage with the remaining platform data.

## Acceptance criteria

- [ ] When platform is saved, clear that platform from generatedPostPack (set content to null)
- [ ] Other platform stays visible if it has content and DRAFT status
- [ ] When both platforms cleared: isGenerated set to false, show "Ready to Write"
- [ ] sessionStorage cleared when both platforms handled
- [ ] sessionStorage updated when single platform cleared
- [ ] Form configuration (topic, tone, keywords) persists after clearing
- [ ] On save failure: preview stays, error toast shown, no state change

## Blocked by

`.scratch/post-preview-clearing/issues/01-platform-param-debounce.md`
