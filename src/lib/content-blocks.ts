import { parseJson } from "@/lib/types";
import { prisma } from "@/lib/db";
import { Prisma, PrismaClient } from "@prisma/client";

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

type DbClient = PrismaClient | Prisma.TransactionClient;

export function normalizeContentBlockName(name: string) {
  return name.trim().toLowerCase();
}

export async function findContentBlockWithName(
  workspaceId: string,
  name: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const target = normalizeContentBlockName(name);
  if (!target) return null;

  const blocks = await db.contentTemplate.findMany({
    where: { workspaceId, kind: "content_card" },
    select: { id: true, name: true },
  });

  return (
    blocks.find((block) => block.id !== excludeId && normalizeContentBlockName(block.name) === target) ??
    null
  );
}

export async function uniqueContentBlockName(
  workspaceId: string,
  baseName: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const trimmed = baseName.trim() || "Untitled_content_block";
  let candidate = trimmed;
  let counter = 2;

  while (await findContentBlockWithName(workspaceId, candidate, excludeId, db)) {
    candidate = `${trimmed}_${counter}`;
    counter += 1;
  }

  return candidate;
}

export function copyContentBlockName(name: string) {
  const base = `${name.trim()}_Copy`.replace(/_Copy(_Copy)+$/g, "_Copy");
  return base.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "Content_block_Copy";
}
