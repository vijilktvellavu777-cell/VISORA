import { detectCsvDataType, normalizeCsvHeader } from "@/lib/csv-parse";
import { extensionAttributeLabel } from "@/lib/list-extension-attributes";

export type ColumnMappingRow = {
  csvHeader: string;
  import: boolean;
  attribute: string;
  samples: string[];
  dataType: string;
};

const HEADER_ALIASES: Record<string, string[]> = {
  email: ["email", "email_address", "e_mail", "mail"],
  first_name: ["first_name", "firstname", "first", "given_name"],
  last_name: ["last_name", "lastname", "last", "surname", "family_name"],
  phone: ["phone", "phone_number", "mobile", "sms", "tel"],
  external_id: ["external_id", "externalid", "user_id", "userid", "id"],
};

function aliasTargets(normalizedHeader: string): string[] {
  const targets: string[] = [normalizedHeader];
  for (const [attribute, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(normalizedHeader)) targets.push(attribute);
  }
  return targets;
}

export function guessVisoraAttribute(
  csvHeader: string,
  allowedAttributes: string[],
  usedAttributes: Set<string>,
): string {
  const normalized = normalizeCsvHeader(csvHeader);
  const candidates = aliasTargets(normalized);

  for (const candidate of candidates) {
    if (!allowedAttributes.includes(candidate)) continue;
    if (usedAttributes.has(candidate)) continue;
    return candidate;
  }

  for (const attribute of allowedAttributes) {
    if (usedAttributes.has(attribute)) continue;
    if (normalizeCsvHeader(extensionAttributeLabel(attribute)) === normalized) return attribute;
    if (normalizeCsvHeader(attribute) === normalized) return attribute;
  }

  return "";
}

export function buildInitialColumnMappings(
  headers: string[],
  rows: Record<string, string>[],
  allowedAttributes: string[],
): ColumnMappingRow[] {
  const used = new Set<string>();

  return headers.map((header) => {
    const attribute = guessVisoraAttribute(header, allowedAttributes, used);
    if (attribute) used.add(attribute);

    const samples = rows.slice(0, 3).map((row) => row[header] ?? "");

    return {
      csvHeader: header,
      import: Boolean(attribute),
      attribute,
      samples,
      dataType: detectCsvDataType(samples),
    };
  });
}

export type ImportColumnMappingPayload = {
  csvHeader: string;
  attribute: string;
  import: boolean;
};

export function mappedRowFromCsvRow(
  row: Record<string, string>,
  mappings: ImportColumnMappingPayload[],
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const mapping of mappings) {
    if (!mapping.import || !mapping.attribute) continue;
    const value = row[mapping.csvHeader] ?? "";
    if (value.trim()) mapped[mapping.attribute] = value.trim();
  }
  return mapped;
}
