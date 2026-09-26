import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const CANVAS_WIZARD_DRAFT_KEY = "visora-canvas-wizard-draft";
export const CANVAS_WIZARD_CREATING_KEY = "visora-canvas-wizard-creating";
export const DUPLICATE_CANVAS_NAME_ERROR = "A canvas with this name already exists.";

export class DuplicateCanvasNameError extends Error {
  constructor(message = DUPLICATE_CANVAS_NAME_ERROR) {
    super(message);
    this.name = "DuplicateCanvasNameError";
  }
}

type DbClient = PrismaClient | Prisma.TransactionClient;

export function normalizeCanvasName(name: string) {
  return name.trim().toLowerCase();
}

export async function findCanvasWithName(
  workspaceId: string,
  name: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const target = normalizeCanvasName(name);
  if (!target) return null;

  const canvases = await db.canvas.findMany({
    where: { workspaceId },
    select: { id: true, name: true },
  });

  return (
    canvases.find(
      (canvas) => canvas.id !== excludeId && normalizeCanvasName(canvas.name) === target,
    ) ?? null
  );
}

export async function uniqueCanvasName(
  workspaceId: string,
  baseName: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const trimmed = baseName.trim() || "Untitled canvas";
  let candidate = trimmed;
  let counter = 2;

  while (await findCanvasWithName(workspaceId, candidate, excludeId, db)) {
    candidate = `${trimmed} (${counter})`;
    counter += 1;
  }

  return candidate;
}

type CreateCanvasData = Omit<Prisma.CanvasUncheckedCreateInput, "workspaceId" | "name">;

export async function createCanvasRecord(
  workspaceId: string,
  requestedName: string,
  data: CreateCanvasData,
  options?: { autoUniqueName?: boolean },
) {
  return prisma.$transaction(async (tx) => {
    const trimmed = requestedName.trim() || "Untitled canvas";
    let name = trimmed;

    if (options?.autoUniqueName) {
      name = await uniqueCanvasName(workspaceId, trimmed, undefined, tx);
    } else {
      const duplicate = await findCanvasWithName(workspaceId, trimmed, undefined, tx);
      if (duplicate) {
        throw new DuplicateCanvasNameError();
      }
    }

    return tx.canvas.create({
      data: {
        workspaceId,
        name,
        ...data,
      },
      include: {
        segment: true,
        _count: { select: { entries: true, steps: true } },
      },
    });
  });
}

export function clearCanvasWizardDraftSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CANVAS_WIZARD_DRAFT_KEY);
  sessionStorage.removeItem(CANVAS_WIZARD_CREATING_KEY);
}

export async function waitForCanvasWizardDraftId(timeoutMs = 8000): Promise<string | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const id = sessionStorage.getItem(CANVAS_WIZARD_DRAFT_KEY);
    if (id) return id;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}
