import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const copy = await prisma.$transaction(async (tx) => {
    const existing = await tx.canvas.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    if (!existing) return null;

    const created = await tx.canvas.create({
      data: {
        workspaceId: workspace.id,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        status: "draft",
        segmentId: existing.segmentId,
        conversionEvents: existing.conversionEvents,
        tags: existing.tags,
        entrySchedule: existing.entrySchedule,
        sendSettings: existing.sendSettings,
        buildLayout: existing.buildLayout,
        steps: {
          create: existing.steps.map((step) => ({
            order: step.order,
            type: step.type,
            name: step.name,
            config: step.config,
          })),
        },
      },
    });

    return created;
  });

  if (!copy) return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
  return NextResponse.json(copy);
}
