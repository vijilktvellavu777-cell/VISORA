import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { errorToResponse } from "@/lib/http";

const eventSchema = z.object({
  name: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
  time: z.string().datetime().optional(),
});

const schema = z.object({
  external_id: z.string().min(1),
  events: z.array(eventSchema).min(1),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiKey(request);
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

  const created = await prisma.$transaction(
    body.events.map((event) =>
      prisma.event.create({
        data: {
          workspaceId,
          customerId: customer.id,
          name: event.name,
          properties: JSON.stringify(event.properties ?? {}),
          occurredAt: event.time ? new Date(event.time) : new Date(),
        },
      }),
    ),
  );

  return NextResponse.json({ accepted: created.length, customer_id: customer.id });
}
