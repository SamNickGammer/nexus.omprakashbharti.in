import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

// Edge-safe auth gate + sliding session.
// The access token lives 1h. On every authenticated request we verify it and
// mint a fresh 1h token, so an active user is silently revalidated and an idle
// one is logged out an hour after their last request.
const TTL = 60 * 60; // 1 hour
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("nexus_session")?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key());
      const res = NextResponse.next();
      const fresh = await new SignJWT({
        userId: payload.userId,
        workspaceId: payload.workspaceId,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${TTL}s`)
        .sign(key());
      res.cookies.set("nexus_session", fresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TTL,
      });
      return res;
    } catch {
      // fall through to redirect
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

// Everything except the login page, auth assets, favicon and logo images.
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|icon.png|logo_).*)"],
};
