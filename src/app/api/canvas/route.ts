import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  DUPLICATE_CANVAS_NAME_ERROR,
  DuplicateCanvasNameError,
  createCanvasRecord,
} from "@/lib/canvas-names";
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

  try {
    const canvas = await createCanvasRecord(
      workspace.id,
      body.name ?? "",
      {
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
      { autoUniqueName: Boolean(body.autoUniqueName) },
    );
    return NextResponse.json(canvas);
  } catch (error) {
    if (error instanceof DuplicateCanvasNameError) {
      return NextResponse.json({ error: DUPLICATE_CANVAS_NAME_ERROR }, { status: 409 });
    }
    throw error;
  }
}
