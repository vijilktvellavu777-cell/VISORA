import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.subject !== undefined ? { subject: body.subject || null } : {}),
      ...(body.fromAddress !== undefined ? { fromAddress: body.fromAddress || null } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.segmentId !== undefined ? { segmentId: body.segmentId || null } : {}),
      ...(body.conversionEvent !== undefined ? { conversionEvent: body.conversionEvent || null } : {}),
      ...(body.scheduledAt !== undefined
        ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
    include: { segment: true },
  });

  return NextResponse.json(campaign);
}
