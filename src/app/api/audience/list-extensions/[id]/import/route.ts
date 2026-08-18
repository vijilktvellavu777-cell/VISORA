import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { resolveExtensionAttributes } from "@/lib/list-extension-attributes";

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

function rowValue(row: Record<string, string>, attribute: string): string | null {
  const direct = row[attribute];
  if (direct) return direct;

  if (attribute === "first_name") return row.firstname || null;
  if (attribute === "last_name") return row.lastname || null;
  if (attribute === "external_id") return row.externalid || null;

  return null;
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

  const attributes = resolveExtensionAttributes(extension.attributes, extension.type);
  const text = await request.text();
  const rows = parseCsv(text);
  let imported = 0;

  for (const row of rows) {
    const externalId =
      rowValue(row, "external_id") ||
      row.email ||
      row.phone ||
      attributes.map((attribute) => rowValue(row, attribute)).find(Boolean) ||
      null;
    if (!externalId) continue;

    const customAttributes: Record<string, string> = {};
    for (const attribute of attributes) {
      if (["first_name", "last_name", "email", "phone", "external_id"].includes(attribute)) continue;
      const value = rowValue(row, attribute);
      if (value) customAttributes[attribute] = value;
    }

    await prisma.listExtensionEntry.create({
      data: {
        extensionId: id,
        externalId,
        email: rowValue(row, "email"),
        phone: rowValue(row, "phone"),
        firstName: rowValue(row, "first_name"),
        lastName: rowValue(row, "last_name"),
        attributes: JSON.stringify(customAttributes),
      },
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}
