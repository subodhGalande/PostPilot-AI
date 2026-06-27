import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

describe("GET /api/dashboard/tokens", () => {
  let tokenLedgerMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    tokenLedgerMock = (await import("@/lib/server/token-ledger")).tokenLedger;
    // Mock getRemainingTokens
    tokenLedgerMock.getRemainingTokens = vi.fn().mockResolvedValue(5);
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const _req = new Request("http://localhost/api/dashboard/tokens");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with remaining tokens", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });

    const _req = new Request("http://localhost/api/dashboard/tokens");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ remaining: 5 });
  });
});
