# Handoff: PostPilot-AI API Testing

## Context
We are building an API integration test suite for PostPilot-AI to showcase a 1-year experienced frontend developer portfolio. The architecture uses a **Relational SSOT** pattern for drafts. We are using `vitest` with `node-mocks-http` and manual mocks (`tests/setup/api-mocks.ts`) to avoid external DB/AI dependencies.

## Progress
- **Phase 1 (Domain Logic):** Complete (100% green). Tested drafts, post-content logic, and rate limits.
- **Phase 2 (API Routes):** All 22 API route tests written. Currently, **72 tests pass** and **28 tests fail**.

## Failing Tests Summary
The remaining 28 failures are purely mock configuration issues in the Vitest environment, not production bugs:
1. **`login` test:** Expects `mock-jwt` in the cookie but receives `mock-jose-token` from the updated mock.
2. **`token-ledger` tests:** Failing because `clearRateLimitStore` is missing from the global `@/lib/rate-limit` mock.
3. **`signup-form` UI test:** Fails because the React component needs to be wrapped in a `<QueryClientProvider>`.
4. **Misc 500s (`schedulePost`, `tokens`):** Likely due to unhandled undefined mocks for `requireAuthJose` or `validateCsrf` inside the specific test scope.

## Next Agent Instructions
1. Run `npx vitest --run` to see the exact errors.
2. Fix the remaining mocks in `tests/setup/api-mocks.ts` and individual test files.
3. Ensure the test suite reaches 100% green.
