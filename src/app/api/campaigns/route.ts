import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  DUPLICATE_CAMPAIGN_NAME_ERROR,
  findCampaignWithName,
  uniqueCampaignName,
} from "@/lib/campaign-names";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    include: { segment: true, _count: { select: { sends: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const requestedName = (body.name ?? "").trim() || "Untitled campaign";
  let name = requestedName;

  const duplicate = await findCampaignWithName(workspace.id, requestedName);
  if (duplicate) {
    if (body.autoUniqueName) {
      name = await uniqueCampaignName(workspace.id, requestedName);
    } else {
      return NextResponse.json({ error: DUPLICATE_CAMPAIGN_NAME_ERROR }, { status: 409 });
    }
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name,
      description: body.description ?? null,
      channel: body.channel,
      status: "draft",
      subject: body.subject ?? null,
      fromAddress: body.fromAddress ?? "VISORA <noreply@visora.app>",
      body: body.body ?? "",
      segmentId: body.segmentId || null,
      conversionEvent: body.conversionEvent ?? null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    },
  });
  return NextResponse.json(campaign);
}
