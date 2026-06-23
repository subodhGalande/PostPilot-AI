import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock external dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    verificationToken: { deleteMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue(true),
    }),
  },
}));

vi.mock("@/lib/csrf", () => ({
  validateCsrf: vi.fn().mockReturnValue({ valid: true }),
  csrfErrorResponse: vi.fn(),
}));

describe("POST /api/auth/signup", () => {
  let prismaMock: any;
  let nodemailerMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock = (await import("@/lib/prisma")).default;
    nodemailerMock = (await import("nodemailer")).default;
  });

  it("returns 400 for invalid input", async () => {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBeDefined(); // Should have zod validation error
  });

  it("returns message if user already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: "1" });

    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
      }),
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.message).toBe("user already exists");
  });

  it("creates verification token and sends email on success", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.verificationToken.create.mockResolvedValueOnce({ id: "token1" });

    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
      }),
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBe("verification email sent");

    expect(prismaMock.verificationToken.create).toHaveBeenCalled();
  });
});
