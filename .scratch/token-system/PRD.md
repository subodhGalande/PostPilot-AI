Status: needs-triage

# Token System — Daily Post Generation Credits

## Problem Statement

Users can generate unlimited AI-powered Drafts via the Generate Post feature, which consumes AI API costs and server resources with no upper bound. There is no mechanism to cap usage per user, prevent abuse, or communicate consumption limits. Users have no visibility into how much generation capacity they have remaining, leading to confusion when the system inevitably needs to enforce limits.

As the platform scales, uncontrolled AI generation creates unpredictable costs and makes it impossible to offer tiered or paid plans. A simple, extensible credit system is needed to cap daily usage, give users visibility into their consumption, and provide a foundation for future monetization features.

## Solution

A token-based daily credit system where each user receives 10 tokens per calendar day (UTC). Each successful post generation consumes 1 token. Tokens are checked before generation begins and are refunded if generation fails. A new Token Ledger Service tracks all allotments, consumption, and refunds immutably, giving full auditability. Users see their remaining tokens prominently in the sidebar.

## User Stories

1. As a user, I want to receive a fresh allotment of 10 tokens daily, so that I can generate posts each day without having to purchase credits.
2. As a user, I want to see my remaining token count in the dashboard sidebar, so that I know how many generations I have left today.
3. As a user, I want to be told when I've exhausted my daily tokens, so that I understand why I can't generate more posts and when I'll get more.
4. As a user, I want my token to be consumed only after a post is successfully generated, so that I don't lose a token when generation fails.
5. As a user, I want my token refunded if AI generation errors, times out, or returns empty content, so that I only pay for working generations.
6. As a user, I want unused tokens to expire at midnight so that the system resets fairly for all users each day.
7. As a user, I want first-time generation on a new day to automatically allocate my tokens, so that I don't need to manually claim them.
8. As a developer, I want an immutable audit trail of all token transactions, so that I can diagnose issues, verify consumption, and build reporting.
9. As a developer, I want token operations (check, deduct, refund) to be atomic and race-condition safe, so that concurrent generation requests don't overshoot the daily limit.
10. As a developer, I want token refunds rate-limited per user, so that a buggy client can't spam the refund endpoint.
11. As an admin, I want the token system designed as a ledger-style table, so that new token types (bonus, purchase, promo) can be added without schema changes.

## Implementation Decisions

### Modules

#### Token Ledger Service (New — Deep Module)
The core of the system. Encapsulates all token arithmetic behind a stable interface:

- **`ensureDailyAllotment(userId)`** — Lazily inserts a +10 ALLOTMENT transaction for the user if no allotment exists for the current UTC day.
- **`consumeToken(userId): boolean`** — Calls ensure + checks balance. If remaining > 0, inserts a -1 CONSUMPTION and returns true. Otherwise returns false.
- **`refundToken(userId)`** — Inserts a +1 REFUND transaction. Returned on generation failure.
- **`getRemainingTokens(userId): number`** — Returns 10 - today's net consumption (consumption + refund). Floors at 0.
- **`getDailyUsage(userId): UsageSummary`** — Returns `{ allotted, used, remaining, total: 10 }` for frontend display.

Implementation notes:
- All `date` logic uses server-side UTC midnight. No timezone ambiguity.
- Concurrent checks are serialized via Prisma `$transaction` to prevent race conditions.
- Refunds are rate-limited: max 10 refunds per minute per user using the existing rate limiter.

#### Token API Endpoint (New)
`GET /api/dashboard/tokens`
- Calls `getDailyUsage(userId)`.
- Returns `{ remaining: number, used: number, total: 10 }`.
- Authenticated via existing JWT middleware. No body required.

#### Generate Post API (Modified)
`POST /api/dashboard/generatePost`
- After authentication, calls `consumeToken(userId)`.
- If false → returns 403 `{ error: "Daily generation limit reached" }`.
- Proceeds with existing flow (validate, fetch user, stream AI).
- Catch block: if a token was consumed, calls `refundToken(userId)` before propagating the error.

#### Error Classifier (Modified)
- New error category `"daily-limit"` added to the existing `ErrorCategory` union.
- Detect `status === 403` and message containing "daily generation limit" → return `daily-limit` category with a user-facing message.

#### Sidebar Component (Modified)
- Client-side fetch to `GET /api/dashboard/tokens` on component mount.
- Displays `⚡ X/10 tokens remaining` below the user avatar section.
- Refetches after each generation attempt (success or error) to show up-to-date count.

#### Generate Post Page (Modified)
- On `useObject` error callback: if error is classified as `daily-limit`, show a toast "You've used all 10 daily generations. Come back tomorrow!" and disable the Generate button.
- Re-enable on next day's first load.

### Schema Changes

New Prisma model:

```prisma
model TokenTransaction {
  id        String    @id @default(cuid())
  userId    String
  amount    Int       // +10 allotment, -1 consumption, +1 refund
  type      TokenType
  createdAt DateTime  @default(now())

  @@index([userId, createdAt])
}

enum TokenType {
  ALLOTMENT
  CONSUMPTION
  REFUND
}
```

Migration: `npx prisma migrate dev --name add_token_transactions`

### Token Flow Diagram

```
User clicks Generate
  │
  ├─ Token Ledger: ensureDailyAllotment(userId)
  │   └─ If no ALLOTMENT for today → insert +10
  │
  ├─ Token Ledger: consumeToken(userId)
  │   ├─ Check: remaining = 10 - SUM(consumption) + SUM(refund)
  │   ├─ If remaining == 0 → return 403
  │   └─ Insert -1 CONSUMPTION → proceed
  │
  ├─ AI generates post (streaming)
  │   ├─ Success → return stream (token already consumed ✓)
  │   └─ Failure → catch block → refundToken(userId) insert +1 REFUND
  │
  └─ Sidebar refetches /api/dashboard/tokens → updates display
```

### Edge Cases & Protections

| Scenario | Handling |
|----------|----------|
| Two simultaneous generate requests | `$transaction` serializes consume — one succeeds, one gets 403 |
| AI fails mid-stream | Token consumed pre-deduct. Catch block refunds. |
| Server crash after deduct, before streaming | Token lost. Rare. Acceptable for v1. Future: cleanup job for stale deductions. |
| Client spams generate button | First call deducts, subsequent calls get 403 until refund. Refunds rate-limited. |
| New user (no allotment today) | Lazy allocation creates it on first `consumeToken` call. |
| Midnight rolls over while user is generating | All times computed server-side at moment of request. Date is stable per request. |
| Clock skew | All date comparisons use `new Date()` server-side only. UTC midnight. |

## Testing Decisions

### Testing Philosophy
Tests should verify external behavior, not implementation details. The Token Ledger Service's public functions (`consumeToken`, `refundToken`, `getRemainingTokens`, `getDailyUsage`) are the contract. Tests should not inspect internal queries or date arithmetic directly.

### Prior Art
The repo has existing tests in `lib/server/draft-store.test.ts` which tests a data-access module against a real database using a test setup helper. The Token Ledger Service tests should follow the same pattern: use a real or in-memory DB (via the existing Prisma test setup), seed known state, and assert on return values.

### Modules to Test

1. **Token Ledger Service** — Core logic, tested in isolation with a seeded DB.
   - New user gets 10 tokens on first request
   - Token deducted after consume
   - Token refunded after refund
   - 11th generation attempt returns false/403
   - New day resets to 10
   - Concurrent calls don't overshoot (test with `Promise.all`)
   - Refund rate limit enforced

2. **Generate Post API** — Integration test (optional for v1).
   - Authenticated request with tokens remaining → 200 + stream
   - Authenticated request with 0 tokens → 403
   - Failed generation → token refunded (check via balance endpoint)
   - Unauthenticated request → 401 (unchanged from current behavior)

3. **Sidebar component** — (optional for v1) Verify token displays after fetch resolves. Verify zero-state when fetch fails.

## Out of Scope

- Token purchase / top-up flow (no Stripe or payment integration)
- Admin token management dashboard
- Multi-tier plans (e.g., 10 tokens for free tier, 50 for pro)
- Token carryover or rollover between days
- Cron job for daily reset (lazy allocation covers this)
- Webhook or event system for token changes
- Email notification when tokens are low
- Token consumption per Platform Variant (LinkedIn vs X)
- Refund for partially-consumed streams (stream wrapper approach deferred)

## Further Notes

- The lazy allocation pattern was chosen over a cron job to eliminate scheduler maintenance, survive server restarts gracefully, and handle users in different timezones correctly (no pre-allocation until they actually use the system).
- Pre-deduct (deduct before stream) was chosen over a stream wrapper for simplicity. The rare edge case of a mid-stream failure consuming a token is acceptable for v1 and can be addressed with a cleanup job later.
- The ledger-style `TokenTransaction` table was chosen over a simple counter on the User model to support future extensibility (bonus tokens, purchased tokens, promo tokens) without schema changes — just add new TokenType values.
- The CONTEXT.md glossary should be updated with Token-related terms once this PRD is ratified.
