Status: completed

# Token Schema + Ledger Service

## Parent

PRD: `.scratch/token-system/PRD.md`

## What to build

Add the `TokenTransaction` model and `TokenType` enum to the Prisma schema and run the migration. Build the Token Ledger Service — a server-side module encapsulating all token arithmetic: lazy daily allotment, consumption, refund, and balance queries. Include unit tests.

This slice does NOT touch any API routes or UI. It is verified via automated tests.

## Acceptance criteria

- [ ] `TokenTransaction` model exists in Prisma schema with fields: `id`, `userId`, `amount`, `type`, `createdAt` + index on `[userId, createdAt]`
- [ ] `TokenType` enum exists with values: `ALLOTMENT`, `CONSUMPTION`, `REFUND`
- [ ] Migration runs successfully (`npx prisma migrate dev`)
- [ ] Token Ledger Service exposes: `ensureDailyAllotment`, `consumeToken`, `refundToken`, `getRemainingTokens`, `getDailyUsage`
- [ ] `ensureDailyAllotment` lazily inserts +10 ALLOTMENT if none exists for today's UTC date
- [ ] `consumeToken` returns false when user has 0 remaining tokens, true and deducts otherwise
- [ ] `refundToken` inserts +1 REFUND transaction
- [ ] `getRemainingTokens` returns current day balance (floored at 0)
- [ ] `getDailyUsage` returns `{ allotted, used, remaining, total: 10 }`
- [ ] All DB operations use Prisma `$transaction` to prevent race conditions
- [ ] Refund operations are rate-limited: max 10 refunds per minute per user via existing rate limiter
- [ ] Tests cover: new user gets 10, consumption deducts, refund restores, 11th attempt blocked, new day resets, concurrent calls don't overshoot

## Blocked by

None — can start immediately
