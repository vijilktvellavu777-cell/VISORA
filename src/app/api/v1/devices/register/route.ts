import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { errorToResponse } from "@/lib/http";

const schema = z.object({
  external_id: z.string().min(1),
  platform: z.enum(["web", "ios", "android"]),
  token: z.string().min(1),
  user_agent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiKey(request, { allowPublishable: true });
  if ("error" in auth) return auth.error;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (error) {
    return errorToResponse(error);
  }
  const workspaceId = auth.apiKey.workspaceId;

  const customer = await prisma.customer.upsert({
    where: { workspaceId_externalId: { workspaceId, externalId: body.external_id } },
    create: {
      workspaceId,
      externalId: body.external_id,
      lastSeenAt: new Date(),
    },
    update: { lastSeenAt: new Date() },
  });

  const device = await prisma.device.upsert({
    where: {
      workspaceId_platform_token: {
        workspaceId,
        platform: body.platform,
        token: body.token,
      },
    },
    create: {
      workspaceId,
      customerId: customer.id,
      platform: body.platform,
      token: body.token,
      userAgent: body.user_agent,
      lastSeenAt: new Date(),
    },
    update: {
      customerId: customer.id,
      userAgent: body.user_agent ?? undefined,
      lastSeenAt: new Date(),
    },
  });

  return NextResponse.json({
    device: {
      id: device.id,
      platform: device.platform,
      customer_id: customer.id,
    },
  });
}
