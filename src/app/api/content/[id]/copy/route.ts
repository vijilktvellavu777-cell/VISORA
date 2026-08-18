import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { copyContentBlockName, uniqueContentBlockName } from "@/lib/content-blocks";
import { getDefaultWorkspace } from "@/lib/workspace";
import { parseJson } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const copy = await prisma.$transaction(async (tx) => {
    const existing = await tx.contentTemplate.findFirst({
      where: { id, workspaceId: workspace.id, kind: "content_card" },
    });
    if (!existing) return null;

    const requestedName = copyContentBlockName(existing.name);
    const name = await uniqueContentBlockName(workspace.id, requestedName, undefined, tx);

    const created = await tx.contentTemplate.create({
      data: {
        workspaceId: workspace.id,
        kind: existing.kind,
        name,
        title: existing.title,
        body: existing.body,
        imageUrl: existing.imageUrl,
        status: "draft",
        description: existing.description,
        tags: existing.tags,
        editorType: existing.editorType,
        blockType: existing.blockType,
        inclusionCount: 0,
      },
    });

    return created;
  });

  if (!copy) {
    return NextResponse.json({ error: "Content block not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...copy,
    tags: parseJson(copy.tags, []),
  });
}
