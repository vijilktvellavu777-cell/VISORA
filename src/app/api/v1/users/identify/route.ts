import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { errorToResponse } from "@/lib/http";

const schema = z.object({
  external_id: z.string().min(1),
  anonymous_id: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

async function mergeAnonymousCustomer(
  workspaceId: string,
  anonymousId: string,
  targetCustomerId: string,
) {
  const anonymous = await prisma.customer.findUnique({
    where: { workspaceId_externalId: { workspaceId, externalId: anonymousId } },
  });
  if (!anonymous || anonymous.id === targetCustomerId) return;

  await prisma.$transaction([
    prisma.event.updateMany({
      where: { customerId: anonymous.id },
      data: { customerId: targetCustomerId },
    }),
    prisma.device.updateMany({
      where: { customerId: anonymous.id },
      data: { customerId: targetCustomerId },
    }),
    prisma.customer.delete({ where: { id: anonymous.id } }),
  ]);
}

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

  const existing = await prisma.customer.findUnique({
    where: { workspaceId_externalId: { workspaceId, externalId: body.external_id } },
  });

  const mergedAttributes = {
    ...(existing ? (JSON.parse(existing.attributes) as Record<string, unknown>) : {}),
    ...(body.attributes ?? {}),
  };

  const customer = await prisma.customer.upsert({
    where: { workspaceId_externalId: { workspaceId, externalId: body.external_id } },
    create: {
      workspaceId,
      externalId: body.external_id,
      email: body.email,
      phone: body.phone,
      firstName: body.first_name,
      lastName: body.last_name,
      country: body.country,
      timezone: body.timezone,
      attributes: JSON.stringify(mergedAttributes),
      lastSeenAt: new Date(),
    },
    update: {
      email: body.email ?? undefined,
      phone: body.phone ?? undefined,
      firstName: body.first_name ?? undefined,
      lastName: body.last_name ?? undefined,
      country: body.country ?? undefined,
      timezone: body.timezone ?? undefined,
      attributes: JSON.stringify(mergedAttributes),
      lastSeenAt: new Date(),
    },
  });

  if (body.anonymous_id && body.anonymous_id !== body.external_id) {
    await mergeAnonymousCustomer(workspaceId, body.anonymous_id, customer.id);
  }

  return NextResponse.json({
    customer: {
      id: customer.id,
      external_id: customer.externalId,
      email: customer.email,
    },
  });
}