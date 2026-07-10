import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge-safe gate: verify the signed session cookie, bounce to /login if absent.
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("nexus_session")?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secret());
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Protect everything except the login page, auth assets, and static files.
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|logo_).*)"],
};
