import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const extension = await prisma.listExtension.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!extension) {
    return NextResponse.json({ error: "Extension not found" }, { status: 404 });
  }

  await prisma.listExtension.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
