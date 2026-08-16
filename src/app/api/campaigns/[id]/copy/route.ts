import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uniqueCampaignName } from "@/lib/campaign-names";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = await uniqueCampaignName(workspace.id, `${existing.name} (Copy)`);

  const copy = await prisma.campaign.create({
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

  return NextResponse.json(copy);
}
