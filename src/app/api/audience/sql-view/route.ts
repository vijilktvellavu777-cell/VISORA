import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function isReadOnlySelect(sql: string): boolean {
  const normalized = sql.trim().replace(/\s+/g, " ").toLowerCase();
  if (!normalized.startsWith("select ")) return false;
  if (/(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/.test(normalized)) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  const workspace = await getDefaultWorkspace();
  const body = (await request.json()) as { sql?: string };
  const sql = body.sql?.trim() ?? "";

  if (!sql) {
    return NextResponse.json({ error: "Enter a SQL query." }, { status: 400 });
  }
  if (!isReadOnlySelect(sql)) {
    return NextResponse.json(
      { error: "Only read-only SELECT queries are allowed." },
      { status: 400 },
    );
  }

  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    select: {
      externalId: true,
      email: true,
      firstName: true,
      lastName: true,
      country: true,
      phone: true,
      timezone: true,
      lastSeenAt: true,
      createdAt: true,
    },
    orderBy: { lastSeenAt: "desc" },
    take: 100,
  });

  const rows = customers.map((customer) => ({
    external_id: customer.externalId,
    email: customer.email,
    first_name: customer.firstName,
    last_name: customer.lastName,
    country: customer.country,
    phone: customer.phone,
    timezone: customer.timezone,
    last_seen_at: customer.lastSeenAt?.toISOString() ?? null,
    created_at: customer.createdAt.toISOString(),
  }));

  return NextResponse.json({ rows, note: "Demo SQL view returns workspace customer rows (query text is validated only)." });
}
