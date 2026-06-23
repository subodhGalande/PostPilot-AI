import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/auth/google", () => {
  it("redirects to google auth url", async () => {
    const req = new Request("http://localhost/api/auth/google");
    const res = await GET();

    expect(res.status).toBe(307);
    const location = res.headers.get("Location");
    expect(location).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(location).toContain("client_id=");
  });
});
