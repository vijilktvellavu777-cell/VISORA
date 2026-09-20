import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCsvText } from "@/lib/csv-parse";
import {
  mappedRowFromCsvRow,
  type ImportColumnMappingPayload,
} from "@/lib/list-extension-import-map";
import { resolveExtensionAttributes } from "@/lib/list-extension-attributes";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

function rowValue(row: Record<string, string>, attribute: string): string | null {
  const direct = row[attribute];
  if (direct) return direct;

  if (attribute === "first_name") return row.firstname || null;
  if (attribute === "last_name") return row.lastname || null;
  if (attribute === "external_id") return row.externalid || null;

  return null;
}

async function importOneRow(
  id: string,
  attributes: string[],
  row: Record<string, string>,
): Promise<number> {
  const externalId =
    rowValue(row, "external_id") ||
    row.email ||
    row.phone ||
    attributes.map((attribute) => rowValue(row, attribute)).find(Boolean) ||
    null;
  if (!externalId) return 0;

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

  return 1;
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
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      csv?: string;
      mappings?: ImportColumnMappingPayload[];
    };
    const csv = body.csv?.trim() ?? "";
    const mappings = body.mappings ?? [];

    if (!csv) {
      return NextResponse.json({ error: "CSV content is required." }, { status: 400 });
    }
    if (!mappings.some((mapping) => mapping.import && mapping.attribute)) {
      return NextResponse.json({ error: "Map at least one CSV column to a VISORA attribute." }, { status: 400 });
    }

    const attributeSet = new Set(attributes);
    for (const mapping of mappings) {
      if (!mapping.import || !mapping.attribute) continue;
      if (!attributeSet.has(mapping.attribute)) {
        return NextResponse.json({ error: `Invalid attribute mapping: ${mapping.attribute}` }, { status: 400 });
      }
    }

    const parsed = parseCsvText(csv);
    const normalizedRows = parsed.rows.map((row) => mappedRowFromCsvRow(row, mappings));
    let imported = 0;
    for (const row of normalizedRows) {
      imported += await importOneRow(id, attributes, row);
    }

    return NextResponse.json({ imported });
  }

  const text = await request.text();
  const parsed = parseCsvText(text);
  const legacyRows = parsed.rows.map((row) => {
    const lowered: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      lowered[key.trim().toLowerCase()] = value;
    }
    return lowered;
  });

  let imported = 0;
  for (const row of legacyRows) {
    imported += await importOneRow(id, attributes, row);
  }

  return NextResponse.json({ imported });
}
