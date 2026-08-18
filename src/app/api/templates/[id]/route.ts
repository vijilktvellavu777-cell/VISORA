import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const template = await prisma.messageTemplate.findFirst({
    where: { id, workspaceId: workspace.id, channel: "email" },
  });

  if (!template) {
    return NextResponse.json({ error: "Email template not found" }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const existing = await prisma.messageTemplate.findFirst({
    where: { id, workspaceId: workspace.id, channel: "email" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Email template not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Email template name is required." }, { status: 400 });
    }
    data.name = name;
  }
  if (body.subject !== undefined) {
    data.subject = typeof body.subject === "string" ? body.subject.trim() || null : null;
  }
  if (typeof body.body === "string") data.body = body.body;
  if (typeof body.editorType === "string") data.editorType = body.editorType;

  const template = await prisma.messageTemplate.update({
    where: { id },
    data,
  });

  return NextResponse.json(template);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.messageTemplate.findFirst({
    where: { id, workspaceId: workspace.id, channel: "email" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Email template not found" }, { status: 404 });
  }

  await prisma.messageTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
