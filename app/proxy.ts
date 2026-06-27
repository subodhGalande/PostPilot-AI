import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenJose, signTokenJose } from "@/lib/auth/jwtjose";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let res = NextResponse.next();

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/dashboard")
  ) {
    const token = req.cookies.get("jwt")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyTokenJose(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Sliding session: if token has less than 30 minutes remaining, refresh it
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    const thirtyMinutes = 30 * 60;

    if (exp && exp - now < thirtyMinutes) {
      // Extract custom payload, omitting standard claims
      const { iat, exp, nbf, jti, ...customPayload } = payload;
      
      const newToken = await signTokenJose(customPayload as any);
      
      res.cookies.set({
        name: "jwt",
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
