import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cols[index] ?? "";
    });
    return row;
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const extension = await prisma.listExtension.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!extension) {
    return NextResponse.json({ error: "Extension not found" }, { status: 404 });
  }

  const text = await request.text();
  const rows = parseCsv(text);
  let imported = 0;

  for (const row of rows) {
    const externalId = row.external_id || row.externalid || row.email || row.phone;
    if (!externalId) continue;

    await prisma.listExtensionEntry.create({
      data: {
        extensionId: id,
        externalId,
        email: row.email || null,
        phone: row.phone || null,
        firstName: row.first_name || row.firstname || null,
        lastName: row.last_name || row.lastname || null,
        attributes: JSON.stringify(
          Object.fromEntries(
            Object.entries(row).filter(
              ([key]) =>
                !["external_id", "externalid", "email", "phone", "first_name", "firstname", "last_name", "lastname"].includes(
                  key,
                ),
            ),
          ),
        ),
      },
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}
