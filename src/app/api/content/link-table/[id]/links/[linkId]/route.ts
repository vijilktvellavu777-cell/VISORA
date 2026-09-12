import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeLinkUrl, validateLinkUrl } from "@/lib/link-table-links";
import { getDefaultWorkspace } from "@/lib/workspace";

type RouteContext = { params: Promise<{ id: string; linkId: string }> };

async function getLinkForWorkspace(linkTableId: string, linkId: string, workspaceId: string) {
  return prisma.linkTableLink.findFirst({
    where: {
      id: linkId,
      linkTableId,
      linkTable: { workspaceId },
    },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id, linkId } = await context.params;
  const existing = await getLinkForWorkspace(id, linkId, workspace.id);
  if (!existing) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  const body = await request.json();
  const data: { name?: string; url?: string; status?: string } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Link name is required." }, { status: 400 });
    }
    data.name = name;
  }

  if (typeof body.url === "string") {
    const url = normalizeLinkUrl(body.url);
    const urlError = validateLinkUrl(url);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 400 });
    }
    data.url = url;
  }

  if (typeof body.status === "string") {
    data.status = body.status;
  }

  const link = await prisma.linkTableLink.update({
    where: { id: existing.id },
    data,
  });

  await prisma.linkTable.update({
    where: { id: existing.linkTableId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(link);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id, linkId } = await context.params;
  const existing = await getLinkForWorkspace(id, linkId, workspace.id);
  if (!existing) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  await prisma.linkTableLink.delete({ where: { id: existing.id } });
  await prisma.linkTable.update({
    where: { id: existing.linkTableId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
