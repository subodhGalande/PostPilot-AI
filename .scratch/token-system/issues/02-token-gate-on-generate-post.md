Status: completed

# Token Gate on Generate Post

## Parent

PRD: `.scratch/token-system/PRD.md`

## What to build

Modify the existing Generate Post API route to check and consume a token before allowing AI generation. If the user has no remaining tokens, return a 403 with `"Daily generation limit reached"`. If generation fails in the catch block, refund the token. Add the `"daily-limit"` category to the error classifier so the frontend can distinguish this error from generic 403s.

This slice does NOT add any UI — the API behavior is verified via HTTP tests.

## Acceptance criteria

- [ ] `POST /api/dashboard/generatePost` calls `consumeToken(userId)` after authentication
- [ ] If `consumeToken` returns false, route responds with status 403 and `{ error: "Daily generation limit reached" }`
- [ ] No other work (body parsing, user fetch, AI call) is performed when tokens are exhausted — fail fast
- [ ] If the catch block fires and a token was consumed, `refundToken(userId)` is called
- [ ] `ErrorCategory` union in error classifier gains `"daily-limit"` value
- [ ] `classifyApiError` detects status 403 with "daily generation" in message and returns `daily-limit` category
- [ ] Tests cover: generate with tokens → 200, generate exhausted → 403, failed AI call → token refunded, unauthenticated → 401 (unchanged)

## Blocked by

- `.scratch/token-system/issues/01-token-schema-and-ledger-service.md`
