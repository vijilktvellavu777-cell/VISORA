import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { copyEmailTemplateName, uniqueEmailTemplateName } from "@/lib/email-templates";
import { getDefaultWorkspace } from "@/lib/workspace";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const copy = await prisma.$transaction(async (tx) => {
    const existing = await tx.messageTemplate.findFirst({
      where: { id, workspaceId: workspace.id, channel: "email" },
    });
    if (!existing) return null;

    const name = await uniqueEmailTemplateName(workspace.id, copyEmailTemplateName(existing.name), undefined, tx);

    const created = await tx.messageTemplate.create({
      data: {
        workspaceId: workspace.id,
        name,
        channel: existing.channel,
        subject: existing.subject,
        body: existing.body,
        editorType: existing.editorType,
        createdBy: existing.createdBy,
        source: "saved",
      },
    });

    return created;
  });

  if (!copy) {
    return NextResponse.json({ error: "Email template not found" }, { status: 404 });
  }

  return NextResponse.json(copy);
}
