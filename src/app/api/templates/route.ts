import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const channel = request.nextUrl.searchParams.get("channel") ?? "email";
  const source = request.nextUrl.searchParams.get("source");
  const templates = await prisma.messageTemplate.findMany({
    where: {
      workspaceId: workspace.id,
      channel,
      ...(source ? { source } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const template = await prisma.messageTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: body.name,
      channel: body.channel ?? "email",
      subject: body.subject ?? null,
      body: body.body ?? "",
      editorType: body.editorType ?? "html",
      createdBy: body.createdBy ?? "VISORA",
      source: body.source ?? "saved",
    },
  });
  return NextResponse.json(template);
}
