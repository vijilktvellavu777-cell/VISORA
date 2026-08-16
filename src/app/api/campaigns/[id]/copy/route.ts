import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uniqueCampaignName } from "@/lib/campaign-names";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const copy = await prisma.$transaction(async (tx) => {
    const existing = await tx.campaign.findFirst({
      where: { id, workspaceId: workspace.id },
    });
    if (!existing) return null;

    const name = await uniqueCampaignName(workspace.id, `${existing.name} (Copy)`, undefined, tx);

    return tx.campaign.create({
      data: {
        workspaceId: workspace.id,
        name,
        description: existing.description,
        channel: existing.channel,
        status: "draft",
        subject: existing.subject,
        fromAddress: existing.fromAddress,
        body: existing.body,
        segmentId: existing.segmentId,
        conversionEvent: existing.conversionEvent,
        scheduledAt: null,
      },
    });
  });

  if (!copy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(copy);
}
