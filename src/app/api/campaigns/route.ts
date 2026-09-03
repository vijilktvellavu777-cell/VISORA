import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  DUPLICATE_CAMPAIGN_NAME_ERROR,
  DuplicateCampaignNameError,
  createCampaignRecord,
} from "@/lib/campaign-names";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId: workspace.id,
      status: { not: CAMPAIGN_STATUS_CREATING },
    },
    include: { segment: true, _count: { select: { sends: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  try {
    const campaign = await createCampaignRecord(
      workspace.id,
      body.name ?? "",
      {
        description: body.description ?? null,
        channel: body.channel,
        status: typeof body.status === "string" ? body.status : CAMPAIGN_STATUS_CREATING,
        subject: body.subject ?? null,
        fromAddress: body.fromAddress ?? "VISORA <noreply@visora.app>",
        body: body.body ?? "",
        segmentId: body.segmentId || null,
        conversionEvent: body.conversionEvent ?? null,
        targetingRules: body.targetingRules ?? "{}",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
      { autoUniqueName: Boolean(body.autoUniqueName) },
    );
    return NextResponse.json(campaign);
  } catch (error) {
    if (error instanceof DuplicateCampaignNameError) {
      return NextResponse.json({ error: DUPLICATE_CAMPAIGN_NAME_ERROR }, { status: 409 });
    }
    throw error;
  }
}
