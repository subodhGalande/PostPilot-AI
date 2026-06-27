import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, clearRateLimitStore } from "./internal-rate-limit";

vi.unmock("@/lib/internal-rate-limit");

describe("rate-limit logic", () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const config = { maxRequests: 2, windowMs: 1000 };
    const res1 = checkRateLimit("test-ip", config);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit("test-ip", config);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const config = { maxRequests: 1, windowMs: 1000 };
    checkRateLimit("test-ip", config);
    const res2 = checkRateLimit("test-ip", config);
    expect(res2.success).toBe(false);
    expect(res2.remaining).toBe(0);
  });

  it("resets limit after window expires", () => {
    const config = { maxRequests: 1, windowMs: 1000 };
    checkRateLimit("test-ip", config);

    // Fast-forward past window
    vi.advanceTimersByTime(1001);

    const res2 = checkRateLimit("test-ip", config);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });
});
