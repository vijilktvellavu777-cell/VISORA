import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidLinkTableType } from "@/lib/link-table";
import { getDefaultWorkspace } from "@/lib/workspace";

type RouteContext = { params: Promise<{ id: string }> };

async function getTableForWorkspace(id: string, workspaceId: string) {
  return prisma.linkTable.findFirst({
    where: { id, workspaceId },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const existing = await getTableForWorkspace(id, workspace.id);
  if (!existing) {
    return NextResponse.json({ error: "Link table not found." }, { status: 404 });
  }

  const body = await request.json();
  const data: { name?: string; type?: string; description?: string | null; status?: string } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Link table name is required." }, { status: 400 });
    }
    data.name = name;
  }

  if (typeof body.type === "string") {
    if (!isValidLinkTableType(body.type)) {
      return NextResponse.json({ error: "Choose a valid link table type." }, { status: 400 });
    }
    data.type = body.type;
  }

  if (typeof body.description === "string") {
    data.description = body.description.trim() || null;
  }

  if (typeof body.status === "string") {
    data.status = body.status;
  }

  const table = await prisma.linkTable.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json(table);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const existing = await getTableForWorkspace(id, workspace.id);
  if (!existing) {
    return NextResponse.json({ error: "Link table not found." }, { status: 404 });
  }

  await prisma.linkTable.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
