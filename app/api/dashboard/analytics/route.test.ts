import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/analytics/queries", () => ({
  getAnalyticsResponse: vi.fn(),
}));

describe("GET /api/dashboard/analytics", () => {
  let analyticsMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    analyticsMock = await import("@/lib/analytics/queries");
  });

  it("returns 401 if unauthorized", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/dashboard/analytics");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid range", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });
    const req = new Request(
      "http://localhost/api/dashboard/analytics?range=999d",
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with analytics data", async () => {
    vi.mocked(await import("@/lib/auth/auth")).requireAuthJose = vi
      .fn()
      .mockResolvedValueOnce({ id: "user1" });
    const mockData = { totalPosts: 10, impressions: 500 };
    analyticsMock.getAnalyticsResponse.mockResolvedValueOnce(mockData);

    const req = new Request(
      "http://localhost/api/dashboard/analytics?range=30d",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockData);
    expect(analyticsMock.getAnalyticsResponse).toHaveBeenCalledWith(
      "user1",
      "30d",
    );
  });
});
