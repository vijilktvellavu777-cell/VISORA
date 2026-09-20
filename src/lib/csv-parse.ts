export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, ""));
}

export function parseCsvText(text: string): ParsedCsv {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

export function normalizeCsvHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function rowLookup(row: Record<string, string>, header: string): string {
  if (header in row) return row[header] ?? "";
  const target = normalizeCsvHeader(header);
  for (const [key, value] of Object.entries(row)) {
    if (normalizeCsvHeader(key) === target) return value;
  }
  return "";
}

export function detectCsvDataType(samples: string[]): string {
  const values = samples.filter((value) => value.trim());
  if (values.length === 0) return "Text";
  if (values.every((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return "Email";
  if (values.every((value) => /^\+?[\d\s().-]{7,}$/.test(value))) return "Phone";
  return "Text";
}
