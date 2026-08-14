import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

const KINDS = ["push", "in_app", "content_card"] as const;

export async function GET(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const kind = request.nextUrl.searchParams.get("kind");
  const templates = await prisma.contentTemplate.findMany({
    where: {
      workspaceId: workspace.id,
      ...(kind && KINDS.includes(kind as (typeof KINDS)[number]) ? { kind } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  if (!KINDS.includes(body.kind)) {
    return NextResponse.json({ error: "kind must be push, in_app, or content_card" }, { status: 400 });
  }
  const template = await prisma.contentTemplate.create({
    data: {
      workspaceId: workspace.id,
      kind: body.kind,
      name: body.name,
      title: body.title ?? null,
      body: body.body ?? "",
      imageUrl: body.imageUrl || null,
    },
  });
  return NextResponse.json(template);
}
