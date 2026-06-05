import { NextResponse } from "next/server";

export function validateCsrf(req: Request): { valid: boolean } {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = process.env.APP_URL;

  if (origin) {
    return { valid: origin === allowed };
  }

  if (referer) {
    return {
      valid: referer === allowed || referer.startsWith(allowed + "/"),
    };
  }

  return { valid: false };
}

export function csrfErrorResponse(): NextResponse {
  return NextResponse.json({ message: "forbidden" }, { status: 403 });
}
