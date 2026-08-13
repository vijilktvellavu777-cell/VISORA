import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      description: body.description ?? null,
      channel: body.channel,
      status: "draft",
      subject: body.subject ?? null,
      body: body.body ?? "",
      segmentId: body.segmentId || null,
    },
  });
  return NextResponse.json(campaign);
}
