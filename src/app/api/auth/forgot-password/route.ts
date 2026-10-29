import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/login-service";
import { errorToResponse } from "@/lib/http";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (error) {
    return errorToResponse(error);
  }

  const result = await requestPasswordReset(body.email);
  return NextResponse.json(result);
}
