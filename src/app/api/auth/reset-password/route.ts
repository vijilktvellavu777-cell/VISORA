import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completePasswordReset } from "@/lib/login-service";
import { errorToResponse } from "@/lib/http";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (error) {
    return errorToResponse(error);
  }

  const result = await completePasswordReset(body.token, body.password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
