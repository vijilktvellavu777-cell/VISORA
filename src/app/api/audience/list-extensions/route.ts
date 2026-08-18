import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const items = await prisma.listExtension.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const attributes = Array.isArray(body.attributes)
    ? body.attributes.filter((value: unknown) => typeof value === "string" && value.trim())
    : [];
  const item = await prisma.listExtension.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      type: body.type ?? "email",
      description: body.description ?? null,
      attributes: JSON.stringify(attributes),
    },
  });
  return NextResponse.json(item);
}
