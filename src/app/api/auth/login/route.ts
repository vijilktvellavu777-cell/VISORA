import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  sessionCookieName,
  sessionCookieOptions,
  sessionMaxAgeSeconds,
} from "@/lib/web-session";
import { authenticateAccount } from "@/lib/login-service";
import { isValidLoginIdentifier } from "@/lib/login-identifier";
import { errorToResponse } from "@/lib/http";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (error) {
    return errorToResponse(error);
  }

  const identifier = body.username.trim();
  if (!isValidLoginIdentifier(identifier)) {
    return NextResponse.json(
      { error: "Enter a valid email address or username." },
      { status: 400 },
    );
  }

  const account = await authenticateAccount(identifier, body.password);
  if (!account) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await createSessionToken(account.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), token, sessionCookieOptions(sessionMaxAgeSeconds()));
  return response;
}
