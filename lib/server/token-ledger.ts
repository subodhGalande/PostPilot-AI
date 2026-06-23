import { checkRateLimit } from "@/lib/rate-limit";
import {
  PrismaTokenLedgerAdapter,
  type DailyUsage,
  type TokenLedgerAdapter,
} from "./token-ledger-adapter";

const REFUND_RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 };

export class InsufficientTokensError extends Error {
  constructor() {
    super("Daily generation limit reached");
    this.name = "InsufficientTokensError";
  }
}

export class RefundRateLimitError extends Error {
  constructor() {
    super("Too many refund attempts");
    this.name = "RefundRateLimitError";
  }
}

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start.getTime() + 86_400_000);
  return { start, end };
}

function refundRateLimitKey(userId: string): string {
  const { start } = getTodayRange();
  return `refund:${userId}:${start.toISOString()}`;
}

export class TokenLedger {
  constructor(private adapter: TokenLedgerAdapter) {}

  async ensureDailyAllotment(userId: string): Promise<void> {
    const { start, end } = getTodayRange();
    await this.adapter.ensureAllotment(userId, start, end);
  }

  async consumeToken(userId: string): Promise<boolean> {
    const { start, end } = getTodayRange();
    const result = await this.adapter.tryConsume(userId, start, end);
    if (!result) {
      throw new InsufficientTokensError();
    }
    return true;
  }

  async refundToken(userId: string): Promise<void> {
    const key = refundRateLimitKey(userId);
    const rateResult = checkRateLimit(key, REFUND_RATE_LIMIT);
    if (!rateResult.success) {
      throw new RefundRateLimitError();
    }
    await this.adapter.insertRefund(userId);
  }

  async getRemainingTokens(userId: string): Promise<number> {
    await this.ensureDailyAllotment(userId);
    const { start, end } = getTodayRange();
    return this.adapter.sumTransactions(userId, start, end);
  }

  async getDailyUsage(userId: string): Promise<DailyUsage> {
    await this.ensureDailyAllotment(userId);
    const { start, end } = getTodayRange();
    return this.adapter.getUsage(userId, start, end);
  }
}

const prismaAdapter = new PrismaTokenLedgerAdapter();
export const tokenLedger = new TokenLedger(prismaAdapter);
