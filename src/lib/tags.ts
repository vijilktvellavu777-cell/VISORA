import { parseJson } from "@/lib/types";

export function parseTags(tags: string | unknown[] | null | undefined) {
  if (Array.isArray(tags)) {
    return tags.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }
  return parseJson<string[]>(typeof tags === "string" ? tags : "[]", []).filter(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

export function normalizeTagName(tag: string) {
  return tag.trim();
}

export function isValidTagName(tag: string) {
  const normalized = normalizeTagName(tag);
  return normalized.length > 0 && normalized.length <= 64;
}
