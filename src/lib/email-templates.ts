import { parseJson } from "@/lib/types";
import { prisma } from "@/lib/db";
import { Prisma, PrismaClient } from "@prisma/client";

export function parseEmailTemplateTags(tags: string | unknown[] | null | undefined) {
  if (Array.isArray(tags)) {
    return tags.filter((value): value is string => typeof value === "string");
  }
  return parseJson<string[]>(typeof tags === "string" ? tags : "[]", []);
}

export function emailTemplateTypeLabel(editorType: string) {
  if (editorType === "drag-drop" || editorType === "drag_drop") return "Drag-and-drop";
  return "HTML";
}

type DbClient = PrismaClient | Prisma.TransactionClient;

export function normalizeEmailTemplateName(name: string) {
  return name.trim().toLowerCase();
}

export async function findEmailTemplateWithName(
  workspaceId: string,
  name: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const target = normalizeEmailTemplateName(name);
  if (!target) return null;

  const templates = await db.messageTemplate.findMany({
    where: { workspaceId, channel: "email" },
    select: { id: true, name: true },
  });

  return (
    templates.find(
      (template) => template.id !== excludeId && normalizeEmailTemplateName(template.name) === target,
    ) ?? null
  );
}

export async function uniqueEmailTemplateName(
  workspaceId: string,
  baseName: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const trimmed = baseName.trim() || "Untitled_email_template";
  let candidate = trimmed;
  let counter = 2;

  while (await findEmailTemplateWithName(workspaceId, candidate, excludeId, db)) {
    candidate = `${trimmed} (${counter})`;
    counter += 1;
  }

  return candidate;
}

export function copyEmailTemplateName(name: string) {
  return `${name.trim()} (Copy)`;
}

export function mapEditorTypeForApi(editorType: "drag_drop" | "html" | null) {
  if (editorType === "drag_drop") return "drag-drop";
  if (editorType === "html") return "html";
  return "html";
}

export function mapEditorTypeFromApi(editorType: string | null | undefined): "drag_drop" | "html" | null {
  if (editorType === "drag-drop" || editorType === "drag_drop") return "drag_drop";
  if (editorType === "html") return "html";
  return null;
}
