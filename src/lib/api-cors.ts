import { NextResponse } from "next/server";

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Authorization, Content-Type, X-Visora-Api-Key";

export function withCors(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");
  return response;
}

export function corsPreflightResponse(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request);
}
