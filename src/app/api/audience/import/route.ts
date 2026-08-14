import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cols[index] ?? "";
    });
    return row;
  });
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const text = await request.text();
  const rows = parseCsv(text);
  let upserted = 0;
  for (const row of rows) {
    const externalId = row.external_id || row.externalid || row.email;
    if (!externalId) continue;
    await prisma.customer.upsert({
      where: { workspaceId_externalId: { workspaceId: workspace.id, externalId } },
      create: {
        workspaceId: workspace.id,
        externalId,
        email: row.email || null,
        firstName: row.first_name || row.firstname || null,
        lastName: row.last_name || row.lastname || null,
        country: row.country || null,
        lastSeenAt: new Date(),
      },
      update: {
        email: row.email || undefined,
        firstName: row.first_name || row.firstname || undefined,
        lastName: row.last_name || row.lastname || undefined,
        country: row.country || undefined,
        lastSeenAt: new Date(),
      },
    });
    upserted += 1;
  }
  return NextResponse.json({ upserted });
}
