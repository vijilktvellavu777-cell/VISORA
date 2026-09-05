import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/api-cors";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return corsPreflightResponse(request);
  }

  const response = NextResponse.next();
  return withCors(response, request);
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
