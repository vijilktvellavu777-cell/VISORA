import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace, loadSegmentAudience } from "@/lib/workspace";

export async function GET(request: NextRequest) {
  const workspace = await getDefaultWorkspace();

  if (request.nextUrl.searchParams.get("stats") === "1") {
    const totalUsers = await prisma.customer.count({ where: { workspaceId: workspace.id } });
    return NextResponse.json({ totalUsers });
  }

  const segmentId = request.nextUrl.searchParams.get("segmentId");
  if (segmentId) {
    const segment = await prisma.segment.findFirst({
      where: { id: segmentId, workspaceId: workspace.id },
    });
    if (!segment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const audience = await loadSegmentAudience(workspace.id, segment.rules);
    return NextResponse.json({
      count: audience.people.length,
      customers: audience.people,
    });
  }

  const segments = await prisma.segment.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(segments);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const segment = await prisma.segment.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      description: body.description ?? null,
      rules: JSON.stringify(body.rules ?? { op: "and", filters: [] }),
    },
  });
  return NextResponse.json(segment);
}
