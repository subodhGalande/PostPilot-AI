import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryTokenLedgerAdapter } from "./token-ledger-adapter";
import { TokenLedger, InsufficientTokensError, RefundRateLimitError } from "./token-ledger";
import { clearRateLimitStore } from "@/lib/rate-limit";

describe("TokenLedger", () => {
  let adapter: InMemoryTokenLedgerAdapter;
  let ledger: TokenLedger;

  beforeEach(() => {
    adapter = new InMemoryTokenLedgerAdapter();
    ledger = new TokenLedger(adapter);
    clearRateLimitStore();
  });

  describe("new user", () => {
    it("has 0 tokens before first interaction", async () => {
      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(0);
    });

    it("gets 10 tokens after ensureDailyAllotment", async () => {
      await ledger.ensureDailyAllotment("user-1");
      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(10);
    });
  });

  describe("ensureDailyAllotment", () => {
    it("is idempotent — multiple calls do not double-allot", async () => {
      await ledger.ensureDailyAllotment("user-1");
      await ledger.ensureDailyAllotment("user-1");
      await ledger.ensureDailyAllotment("user-1");

      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(10);
    });

    it("allots tokens per user independently", async () => {
      await ledger.ensureDailyAllotment("user-1");
      await ledger.ensureDailyAllotment("user-2");

      expect(await ledger.getRemainingTokens("user-1")).toBe(10);
      expect(await ledger.getRemainingTokens("user-2")).toBe(10);
    });
  });

  describe("consumeToken", () => {
    it("deducts one token from balance (with lazy allotment)", async () => {
      await ledger.consumeToken("user-1");

      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(9);
    });

    it("deducts correctly after explicit allotment", async () => {
      await ledger.ensureDailyAllotment("user-1");
      await ledger.consumeToken("user-1");

      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(9);
    });

    it("throws InsufficientTokensError when all 10 tokens are used", async () => {
      for (let i = 0; i < 10; i++) {
        await ledger.consumeToken("user-1");
      }

      await expect(ledger.consumeToken("user-1")).rejects.toThrow(
        InsufficientTokensError,
      );
      const remaining = await ledger.getRemainingTokens("user-1");
      expect(remaining).toBe(0);
    });

    it("is per-user — user-2 cannot affect user-1's balance", async () => {
      await ledger.consumeToken("user-1");
      await ledger.consumeToken("user-2");
      await ledger.consumeToken("user-2");

      expect(await ledger.getRemainingTokens("user-1")).toBe(9);
      expect(await ledger.getRemainingTokens("user-2")).toBe(8);
    });
  });

  describe("refundToken", () => {
    it("restores one token after consumption", async () => {
      await ledger.consumeToken("user-1");
      expect(await ledger.getRemainingTokens("user-1")).toBe(9);

      await ledger.refundToken("user-1");
      expect(await ledger.getRemainingTokens("user-1")).toBe(10);
    });

    it("can refund even without prior consumption", async () => {
      await ledger.ensureDailyAllotment("user-1");
      await ledger.refundToken("user-1");
      expect(await ledger.getRemainingTokens("user-1")).toBe(11);
    });

    it("throws RefundRateLimitError when rate-limited", async () => {
      for (let i = 0; i < 10; i++) {
        await ledger.refundToken("user-1");
      }

      await expect(ledger.refundToken("user-1")).rejects.toThrow(
        RefundRateLimitError,
      );
    });

    it("rate limiter is per-user", async () => {
      for (let i = 0; i < 10; i++) {
        await ledger.refundToken("user-1");
      }

      await expect(ledger.refundToken("user-2")).resolves.toBeUndefined();
    });
  });

  describe("getDailyUsage", () => {
    it("returns zeroed usage for new user", async () => {
      const usage = await ledger.getDailyUsage("user-1");
      expect(usage).toEqual({
        allotted: 0,
        used: 0,
        refunded: 0,
        remaining: 0,
        total: 10,
      });
    });

    it("reflects full flow: allot, consume, refund", async () => {
      await ledger.consumeToken("user-1");
      await ledger.consumeToken("user-1");
      await ledger.refundToken("user-1");

      const usage = await ledger.getDailyUsage("user-1");
      expect(usage).toEqual({
        allotted: 10,
        used: 2,
        refunded: 1,
        remaining: 9,
        total: 10,
      });
    });

    it("caps remaining at 0 even if over-consumed", async () => {
      for (let i = 0; i < 10; i++) {
        await ledger.consumeToken("user-1");
      }

      const usage = await ledger.getDailyUsage("user-1");
      expect(usage.remaining).toBe(0);
    });
  });

  describe("consume-refund cycle", () => {
    it("supports repeated consume-refund cycles within limits", async () => {
      for (let cycle = 0; cycle < 3; cycle++) {
        await ledger.consumeToken("user-1");
        expect(await ledger.getRemainingTokens("user-1")).toBe(9);
        await ledger.refundToken("user-1");
        expect(await ledger.getRemainingTokens("user-1")).toBe(10);
      }
    });
  });
});
