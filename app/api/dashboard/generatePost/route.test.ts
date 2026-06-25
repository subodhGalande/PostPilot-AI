import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/dashboard/generatePost", () => {
  let tokenLedgerMock: any;
  let aiMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    tokenLedgerMock = (await import("@/lib/server/token-ledger")).tokenLedger;
    aiMock = await import("ai");
    prismaMock = (await import("@/lib/prisma")).default;

    prismaMock.user.findUnique.mockResolvedValue({
      accountName: "Test",
      accountType: "Personal",
      industry: "Tech",
      description: "Test description",
    });
  });

  it("returns 400 for invalid input schema", async () => {
    const req = new Request("http://localhost/api/dashboard/generatePost", {
      method: "POST",
      body: JSON.stringify({ topic: "" }), // Invalid empty topic
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("consumes a token and calls streamObject on success", async () => {
    const req = new Request("http://localhost/api/dashboard/generatePost", {
      method: "POST",
      body: JSON.stringify({
        topic: "AI",
        tone: "professional",
        postStyle: "short",
        targetAudience: "devs",
        keywords: ["ai"],
        modelName: "gemini-1.5-pro",
      }),
    });

    const res = await POST(req);

    expect(tokenLedgerMock.consumeToken).toHaveBeenCalled();
    expect(aiMock.streamObject).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("refunds token if generation throws error", async () => {
    aiMock.streamObject.mockRejectedValueOnce(new Error("AI error"));

    const req = new Request("http://localhost/api/dashboard/generatePost", {
      method: "POST",
      body: JSON.stringify({
        topic: "AI",
        tone: "professional",
        postStyle: "short",
        targetAudience: "devs",
        keywords: [],
        modelName: "gemini-1.5-pro",
      }),
    });

    const res = await POST(req);

    expect(tokenLedgerMock.consumeToken).toHaveBeenCalled();
    expect(tokenLedgerMock.refundToken).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it("refunds token if stream fails midway (onFinish error)", async () => {
    aiMock.streamObject.mockImplementationOnce((args: any) => {
      Promise.resolve().then(() => {
        if (args.onFinish) {
          args.onFinish({ error: new Error("Stream failed midway"), object: undefined });
        }
      });
      return {
        toTextStreamResponse: () => new Response("mock stream"),
      };
    });

    const req = new Request("http://localhost/api/dashboard/generatePost", {
      method: "POST",
      body: JSON.stringify({
        topic: "AI",
        tone: "professional",
        postStyle: "short",
        targetAudience: "devs",
        keywords: [],
        modelName: "gemini-1.5-pro",
      }),
    });

    const res = await POST(req);

    // Wait a tick for the onFinish promise chain to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(tokenLedgerMock.consumeToken).toHaveBeenCalled();
    expect(tokenLedgerMock.refundToken).toHaveBeenCalled();
    expect(res.status).toBe(200); // Status is 200 because the stream had already started
  });
});
