import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const lists = await prisma.suppressionList.findMany({
    where: { workspaceId: workspace.id },
    include: { entries: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lists);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const list = await prisma.suppressionList.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      channel: body.channel ?? "all",
    },
    include: { entries: true },
  });
  return NextResponse.json(list);
}
