import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears cookie", async () => {
    const req = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie") || "";
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970");
    expect(setCookie).toContain("jwt=");
  });
});
