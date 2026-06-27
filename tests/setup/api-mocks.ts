import { vi } from "vitest";

// Shared mock for Prisma
export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  verificationToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  post: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  tokenTransaction: {
    findFirst: vi.fn(),
    create: vi.fn(),
    aggregate: vi.fn(),
  },
  $transaction: vi.fn((arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return arg(prismaMock);
  }),
};

vi.mock("@/lib/prisma", () => ({
  default: prismaMock,
}));

// Shared mock for Auth/JWT
vi.mock("@/lib/auth/auth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  verifyToken: vi.fn().mockResolvedValue({ email: "test@example.com" }),
  requireAuthJose: vi
    .fn()
    .mockResolvedValue({ id: "1", email: "test@example.com", tokenVersion: 1 }),
}));

vi.mock("@/lib/auth/jwtjose", () => ({
  signTokenJose: vi.fn().mockResolvedValue("mock-jose-token"),
  verifyTokenJose: vi.fn().mockResolvedValue({ email: "test@example.com" }),
}));

// Shared mock for AI SDK
vi.mock("ai", () => ({
  streamObject: vi.fn().mockReturnValue({
    toTextStreamResponse: vi.fn().mockReturnValue(new Response("mock stream")),
  }),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn().mockReturnValue(vi.fn()),
}));

// Shared mock for Token Ledger
vi.mock("@/lib/server/token-ledger", () => {
  class InsufficientTokensError extends Error {
    constructor() {
      super("Insufficient tokens");
      this.name = "InsufficientTokensError";
    }
  }
  return {
    tokenLedger: {
      consumeToken: vi.fn().mockResolvedValue(true),
      refundToken: vi.fn().mockResolvedValue(true),
      getDailyUsage: vi.fn().mockResolvedValue({ remaining: 5 }),
    },
    TokenLedger: class {
      consumeToken = vi.fn().mockResolvedValue(true);
      refundToken = vi.fn().mockResolvedValue(true);
      getRemainingTokens = vi.fn().mockResolvedValue(5);
    },
    InsufficientTokensError,
  };
});

// Shared mock for next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({ value: "mock-cookie-value" }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Shared mock for Rate Limit
vi.mock("@/lib/internal-rate-limit", () => ({
  checkRateLimit: vi
    .fn()
    .mockReturnValue({ success: true, remaining: 100, resetTime: Date.now() }),
  rateLimitExceededResponse: vi
    .fn()
    .mockReturnValue(new Response("Rate limit exceeded", { status: 429 })),
  buildRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

// Shared mock for Nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue(true),
    }),
  },
}));

// Shared mock for CSRF
vi.mock("@/lib/csrf", () => ({
  validateCsrf: vi.fn().mockReturnValue({ valid: true }),
  csrfErrorResponse: vi
    .fn()
    .mockReturnValue(new Response(null, { status: 403 })),
}));

// Shared mock for UploadThing
vi.mock("uploadthing/server", () => {
  return {
    UTApi: class {
      deleteFiles = vi.fn().mockResolvedValue({ success: true });
      uploadFiles = vi
        .fn()
        .mockResolvedValue([{ data: { url: "https://mock-url.com" } }]);
    },
  };
});
