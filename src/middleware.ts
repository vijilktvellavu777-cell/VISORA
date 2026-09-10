import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/api-cors";
import { sessionCookieName, verifySessionToken } from "@/lib/web-session";

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/visora.js" || pathname === "/visora-sw.js") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1")) {
    if (request.method === "OPTIONS") {
      return corsPreflightResponse(request);
    }
    const response = NextResponse.next();
    return withCors(response, request);
  }

  const session = request.cookies.get(sessionCookieName())?.value;
  const username = await verifySessionToken(session);

  if (pathname === "/login") {
    if (username) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isPublicPath(pathname) && !username) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
