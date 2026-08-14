import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const projects = await prisma.planProject.findMany({
    where: { workspaceId: workspace.id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const project = await prisma.planProject.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      description: body.description ?? null,
    },
    include: { tasks: true },
  });
  return NextResponse.json(project);
}
