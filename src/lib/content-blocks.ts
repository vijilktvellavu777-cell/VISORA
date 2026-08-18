import { parseJson } from "@/lib/types";

export function contentBlockLiquidSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function contentBlockLiquidTag(name: string) {
  const slug = contentBlockLiquidSlug(name);
  return slug ? `{{content_blocks.${slug}}}` : "{{content_blocks.${}}}";
}

export function isValidContentBlockName(name: string) {
  return /^[a-zA-Z0-9_-]+$/.test(name.trim());
}

export function parseContentTags(tags: string | unknown[] | null | undefined) {
  if (Array.isArray(tags)) {
    return tags.filter((value): value is string => typeof value === "string");
  }
  return parseJson<string[]>(typeof tags === "string" ? tags : "[]", []);
}

export function contentBlockTypeLabel(blockType: string) {
  if (blockType === "in_app_message") return "In-app message";
  return "Content block";
}
