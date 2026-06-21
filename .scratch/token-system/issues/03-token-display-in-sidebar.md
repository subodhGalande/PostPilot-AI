Status: completed

# Token Display in Sidebar

## Parent

PRD: `.scratch/token-system/PRD.md`

## What to build

Create a `GET /api/dashboard/tokens` endpoint that returns the user's current token usage. Modify the sidebar component to fetch this endpoint on mount and display `⚡ X/10 tokens remaining` below the user avatar section. The display updates when the component re-renders (e.g., after page navigation or a generation attempt).

## Acceptance criteria

- [ ] `GET /api/dashboard/tokens` returns `{ remaining: number, used: number, total: 10 }`
- [ ] Endpoint is authenticated — returns 401 for unauthenticated requests
- [ ] Endpoint calls `getDailyUsage(userId)` from the Token Ledger Service
- [ ] Sidebar component fetches `/api/dashboard/tokens` on mount via useEffect
- [ ] Sidebar displays `⚡ X/10 tokens remaining` below the user avatar/email section
- [ ] Sidebar gracefully handles fetch failure (shows nothing / dash instead of crashing)
- [ ] Sidebar shows correct count immediately after a new day's first generation

## Blocked by

- `.scratch/token-system/issues/01-token-schema-and-ledger-service.md`
- `.scratch/token-system/issues/02-token-gate-on-generate-post.md`
