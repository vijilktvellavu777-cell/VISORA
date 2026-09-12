import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function getLinkForWorkspace(id: string, workspaceId: string) {
  return prisma.linkTableEntry.findFirst({
    where: { id, workspaceId },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const existing = await getLinkForWorkspace(id, workspace.id);
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
    const url = normalizeUrl(body.url);
    if (!url) {
      return NextResponse.json({ error: "Link URL is required." }, { status: 400 });
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Enter a valid link URL." }, { status: 400 });
    }
    data.url = url;
  }

  if (typeof body.status === "string") {
    data.status = body.status;
  }

  const link = await prisma.linkTableEntry.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json(link);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const workspace = await getDefaultWorkspace();
  const { id } = await context.params;
  const existing = await getLinkForWorkspace(id, workspace.id);
  if (!existing) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  await prisma.linkTableEntry.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
