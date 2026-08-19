import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const folders = await prisma.mediaFolder.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { files: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(folders);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      workspaceId: workspace.id,
      name,
    },
    include: { _count: { select: { files: true } } },
  });

  return NextResponse.json(folder);
}
