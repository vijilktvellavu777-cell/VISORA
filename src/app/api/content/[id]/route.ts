import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidContentBlockName } from "@/lib/content-blocks";
import { getDefaultWorkspace } from "@/lib/workspace";
import { parseJson } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const template = await prisma.contentTemplate.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Content template not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...template,
    tags: parseJson(template.tags, []),
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const existing = await prisma.contentTemplate.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Content template not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Content block name is required." }, { status: 400 });
    }
    if (existing.kind === "content_card" && !isValidContentBlockName(name)) {
      return NextResponse.json(
        { error: "Use letters, numbers, hyphens, and underscores only." },
        { status: 400 },
      );
    }
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.editorType === "string") data.editorType = body.editorType;
  if (typeof body.blockType === "string") data.blockType = body.blockType;
  if (body.title !== undefined) data.title = typeof body.title === "string" ? body.title : null;
  if (typeof body.body === "string") data.body = body.body;
  if (body.imageUrl !== undefined) data.imageUrl = typeof body.imageUrl === "string" ? body.imageUrl || null : null;
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);

  const template = await prisma.contentTemplate.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    ...template,
    tags: parseJson(template.tags, []),
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.contentTemplate.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Content template not found" }, { status: 404 });
  }

  await prisma.contentTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
