import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ externalId: string }> },
) {
  const auth = await requireApiKey(request);
  if ("error" in auth) return auth.error;
  const { externalId } = await context.params;

  const customer = await prisma.customer.findUnique({
    where: {
      workspaceId_externalId: {
        workspaceId: auth.apiKey.workspaceId,
        externalId,
      },
    },
    include: { events: { orderBy: { occurredAt: "desc" }, take: 50 } },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    external_id: customer.externalId,
    email: customer.email,
    first_name: customer.firstName,
    last_name: customer.lastName,
    country: customer.country,
    attributes: parseJson(customer.attributes, {}),
    subscriptions: parseJson(customer.subscriptions, {}),
    last_seen_at: customer.lastSeenAt,
    events: customer.events.map((event) => ({
      name: event.name,
      properties: parseJson(event.properties, {}),
      time: event.occurredAt,
    })),
  });
}
