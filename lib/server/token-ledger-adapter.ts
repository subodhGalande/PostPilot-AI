import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

export type TokenType = "ALLOTMENT" | "CONSUMPTION" | "REFUND";

export interface TokenTransactionRecord {
  id: string;
  userId: string;
  amount: number;
  type: TokenType;
  createdAt: Date;
}

export interface DailyUsage {
  allotted: number;
  used: number;
  refunded: number;
  remaining: number;
  total: number;
}

export interface TokenLedgerAdapter {
  ensureAllotment(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<void>;
  tryConsume(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<boolean>;
  insertRefund(userId: string): Promise<void>;
  sumTransactions(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<number>;
  getUsage(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<DailyUsage>;
}

function getDefaultUsage(): DailyUsage {
  return { allotted: 0, used: 0, refunded: 0, remaining: 0, total: 10 };
}

export class PrismaTokenLedgerAdapter implements TokenLedgerAdapter {
  async ensureAllotment(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.tokenTransaction.findFirst({
        where: {
          userId,
          type: "ALLOTMENT",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      });
      if (!existing) {
        await tx.tokenTransaction.create({
          data: { userId, amount: 10, type: "ALLOTMENT" },
        });
      }
    });
  }

  async tryConsume(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.tokenTransaction.findFirst({
        where: {
          userId,
          type: "ALLOTMENT",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      });
      if (!existing) {
        await tx.tokenTransaction.create({
          data: { userId, amount: 10, type: "ALLOTMENT" },
        });
      }

      const aggregation = await tx.tokenTransaction.aggregate({
        where: {
          userId,
          createdAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amount: true },
      });

      const balance = aggregation._sum.amount ?? 0;
      if (balance <= 0) return false;

      await tx.tokenTransaction.create({
        data: { userId, amount: -1, type: "CONSUMPTION" },
      });

      return true;
    });
  }

  async insertRefund(userId: string): Promise<void> {
    await prisma.tokenTransaction.create({
      data: { userId, amount: 1, type: "REFUND" },
    });
  }

  async sumTransactions(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<number> {
    const aggregation = await prisma.tokenTransaction.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart, lt: todayEnd },
      },
      _sum: { amount: true },
    });
    return Math.max(0, aggregation._sum.amount ?? 0);
  }

  async getUsage(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<DailyUsage> {
    const [allotments, consumptions, refunds] = await Promise.all([
      prisma.tokenTransaction.aggregate({
        where: {
          userId,
          type: "ALLOTMENT",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: {
          userId,
          type: "CONSUMPTION",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: {
          userId,
          type: "REFUND",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const allotted = allotments._sum.amount ?? 0;
    const consumed = Math.abs(consumptions._sum.amount ?? 0);
    const refunded = refunds._sum.amount ?? 0;
    const remaining = Math.max(0, allotted - consumed + refunded);

    return { allotted, used: consumed, refunded, remaining, total: 10 };
  }
}

interface StoredTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TokenType;
  createdAt: Date;
}

export class InMemoryTokenLedgerAdapter implements TokenLedgerAdapter {
  private transactions = new Map<string, StoredTransaction>();
  private nextId = 1;

  reset(): void {
    this.transactions.clear();
    this.nextId = 1;
  }

  private genId(): string {
    return `mem-${this.nextId++}`;
  }

  async ensureAllotment(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<void> {
    const existing = Array.from(this.transactions.values()).find(
      (t) =>
        t.userId === userId &&
        t.type === "ALLOTMENT" &&
        t.createdAt >= todayStart &&
        t.createdAt < todayEnd,
    );
    if (!existing) {
      const tx: StoredTransaction = {
        id: this.genId(),
        userId,
        amount: 10,
        type: "ALLOTMENT",
        createdAt: new Date(),
      };
      this.transactions.set(tx.id, tx);
    }
  }

  async tryConsume(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<boolean> {
    await this.ensureAllotment(userId, todayStart, todayEnd);

    const balance = this.calcBalance(userId, todayStart, todayEnd);
    if (balance <= 0) return false;

    const tx: StoredTransaction = {
      id: this.genId(),
      userId,
      amount: -1,
      type: "CONSUMPTION",
      createdAt: new Date(),
    };
    this.transactions.set(tx.id, tx);
    return true;
  }

  async insertRefund(userId: string): Promise<void> {
    const tx: StoredTransaction = {
      id: this.genId(),
      userId,
      amount: 1,
      type: "REFUND",
      createdAt: new Date(),
    };
    this.transactions.set(tx.id, tx);
  }

  async sumTransactions(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<number> {
    return Math.max(0, this.calcBalance(userId, todayStart, todayEnd));
  }

  async getUsage(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): Promise<DailyUsage> {
    let allotted = 0;
    let consumed = 0;
    let refunded = 0;

    for (const t of this.transactions.values()) {
      if (t.userId !== userId) continue;
      if (t.createdAt < todayStart || t.createdAt >= todayEnd) continue;

      if (t.type === "ALLOTMENT") allotted += t.amount;
      else if (t.type === "CONSUMPTION") consumed += Math.abs(t.amount);
      else if (t.type === "REFUND") refunded += t.amount;
    }

    const remaining = Math.max(0, allotted - consumed + refunded);
    return { allotted, used: consumed, refunded, remaining, total: 10 };
  }

  private calcBalance(
    userId: string,
    todayStart: Date,
    todayEnd: Date,
  ): number {
    let balance = 0;
    for (const t of this.transactions.values()) {
      if (t.userId !== userId) continue;
      if (t.createdAt < todayStart || t.createdAt >= todayEnd) continue;
      balance += t.amount;
    }
    return balance;
  }
}
