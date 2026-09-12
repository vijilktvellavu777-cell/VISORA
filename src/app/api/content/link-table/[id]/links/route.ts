import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeLinkUrl, validateLinkUrl } from "@/lib/link-table-links";
import { getDefaultWorkspace } from "@/lib/workspace";

type RouteContext = { params: Promise<{ id: string }> };

async function getTableForWorkspace(id: string, workspaceId: string) {
  return prisma.linkTable.findFirst({
    where: { id, workspaceId },
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const table = await getTableForWorkspace(id, workspace.id);
  if (!table) {
    return NextResponse.json({ error: "Link table not found." }, { status: 404 });
  }

  const links = await prisma.linkTableLink.findMany({
    where: { linkTableId: table.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const table = await getTableForWorkspace(id, workspace.id);
  if (!table) {
    return NextResponse.json({ error: "Link table not found." }, { status: 404 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const url = normalizeLinkUrl(typeof body.url === "string" ? body.url : "");

  if (!name) {
    return NextResponse.json({ error: "Link name is required." }, { status: 400 });
  }

  const urlError = validateLinkUrl(url);
  if (urlError) {
    return NextResponse.json({ error: urlError }, { status: 400 });
  }

  const link = await prisma.linkTableLink.create({
    data: {
      linkTableId: table.id,
      name,
      url,
      status: typeof body.status === "string" ? body.status : "active",
    },
  });

  await prisma.linkTable.update({
    where: { id: table.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(link);
}
