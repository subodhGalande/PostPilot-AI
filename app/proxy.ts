import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenJose } from "@/lib/auth/jwtjose";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("jwt")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyTokenJose(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
