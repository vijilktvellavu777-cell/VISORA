import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const canvases = await prisma.canvas.findMany({
    where: { workspaceId: workspace.id },
    include: {
      segment: true,
      _count: { select: { entries: true, steps: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(canvases);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const canvas = await prisma.canvas.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      description: body.description ?? null,
      status: "draft",
      segmentId: body.segmentId || null,
      steps: body.steps?.length
        ? {
            create: body.steps.map(
              (step: { order: number; type: string; name: string; config?: string }, index: number) => ({
                order: step.order ?? index,
                type: step.type,
                name: step.name,
                config: step.config ?? "{}",
              }),
            ),
          }
        : undefined,
    },
    include: {
      segment: true,
      _count: { select: { entries: true, steps: true } },
    },
  });
  return NextResponse.json(canvas);
}
