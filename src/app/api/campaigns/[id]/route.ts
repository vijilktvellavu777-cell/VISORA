import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  DUPLICATE_CAMPAIGN_NAME_ERROR,
  findCampaignWithName,
} from "@/lib/campaign-names";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { segment: true },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }
    const duplicate = await findCampaignWithName(workspace.id, name, id);
    if (duplicate) {
      return NextResponse.json({ error: DUPLICATE_CAMPAIGN_NAME_ERROR }, { status: 409 });
    }
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.subject !== undefined ? { subject: body.subject || null } : {}),
      ...(body.preheader !== undefined ? { preheader: body.preheader || null } : {}),
      ...(body.fromAddress !== undefined ? { fromAddress: body.fromAddress || null } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.segmentId !== undefined ? { segmentId: body.segmentId || null } : {}),
      ...(body.targetingRules !== undefined ? { targetingRules: body.targetingRules } : {}),
      ...(body.conversionEvent !== undefined ? { conversionEvent: body.conversionEvent || null } : {}),
      ...(Array.isArray(body.tags) ? { tags: JSON.stringify(body.tags) } : {}),
      ...(body.scheduledAt !== undefined
        ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
    include: { segment: true },
  });

  return NextResponse.json(campaign);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
