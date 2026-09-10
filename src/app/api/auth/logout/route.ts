import { NextResponse } from "next/server";
import { sessionCookieName, sessionCookieOptions } from "@/lib/web-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), "", {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
  response.cookies.delete(sessionCookieName());
  return response;
}
