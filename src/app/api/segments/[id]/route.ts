import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const existing = await prisma.segment.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : existing.name;
  if (!name) {
    return NextResponse.json({ error: "Segment name is required." }, { status: 400 });
  }

  const segment = await prisma.segment.update({
    where: { id },
    data: {
      name,
      description:
        body.description === undefined ? existing.description : body.description || null,
      rules:
        body.rules === undefined ? existing.rules : JSON.stringify(body.rules),
    },
  });

  return NextResponse.json(segment);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const existing = await prisma.segment.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.campaign.updateMany({ where: { segmentId: id }, data: { segmentId: null } }),
    prisma.canvas.updateMany({ where: { segmentId: id }, data: { segmentId: null } }),
    prisma.segment.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
