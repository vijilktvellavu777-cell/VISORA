import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { parseJson } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const canvas = await prisma.canvas.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      segment: true,
      steps: { orderBy: { order: "asc" } },
      _count: { select: { entries: true, steps: true } },
    },
  });

  if (!canvas) {
    return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
  }

  return NextResponse.json(canvas);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const existing = await prisma.canvas.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") data.name = body.name.trim();
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if (typeof body.status === "string") data.status = body.status;
  if (body.segmentId !== undefined) data.segmentId = body.segmentId || null;
  if (Array.isArray(body.conversionEvents)) {
    data.conversionEvents = JSON.stringify(body.conversionEvents.slice(0, 4));
  }
  if (Array.isArray(body.tags)) {
    data.tags = JSON.stringify(body.tags);
  }
  if (body.entrySchedule !== undefined) {
    data.entrySchedule = JSON.stringify(body.entrySchedule ?? {});
  }
  if (body.sendSettings !== undefined) {
    data.sendSettings = JSON.stringify(body.sendSettings ?? {});
  }

  if (Array.isArray(body.steps)) {
    await prisma.canvasStep.deleteMany({ where: { canvasId: id } });
    await prisma.canvasStep.createMany({
      data: body.steps.map(
        (step: { type: string; name: string; config?: string }, index: number) => ({
          canvasId: id,
          order: index,
          type: step.type,
          name: step.name,
          config: step.config ?? "{}",
        }),
      ),
    });
  }

  const canvas = await prisma.canvas.update({
    where: { id },
    data,
    include: {
      segment: true,
      steps: { orderBy: { order: "asc" } },
      _count: { select: { entries: true, steps: true } },
    },
  });

  return NextResponse.json({
    ...canvas,
    conversionEvents: parseJson(canvas.conversionEvents, []),
    tags: parseJson(canvas.tags, []),
    entrySchedule: parseJson(canvas.entrySchedule, {}),
    sendSettings: parseJson(canvas.sendSettings, {}),
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.canvas.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
  }

  await prisma.canvas.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
