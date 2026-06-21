Status: completed

# 403 Handling on Generate Page

## Parent

PRD: `.scratch/token-system/PRD.md`

## What to build

Handle the 403 daily-limit error in the Generate Post page's `useObject` error callback. When the error is classified as `daily-limit`, show a toast: "You've used all 10 daily generations. Come back tomorrow!" and disable the Generate button. On page load, check remaining tokens and keep the button disabled if zero. The button re-enables automatically on the next day when tokens refresh.

## Acceptance criteria

- [ ] `useObject` error callback classifies the error via `classifyApiError`
- [ ] If category is `daily-limit`, a toast/banner displays: "You've used all 10 daily generations. Come back tomorrow!"
- [ ] The Generate button is disabled after the error, preventing further submission attempts
- [ ] On page mount, remaining tokens are checked and button is disabled if 0
- [ ] Button re-enables without page reload when tokens become available (next day)
- [ ] Loading/disabled states have appropriate styling (matching existing disabled button patterns)

## Blocked by

- `.scratch/token-system/issues/02-token-gate-on-generate-post.md`
