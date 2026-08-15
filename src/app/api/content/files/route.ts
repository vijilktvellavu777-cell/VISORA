import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

const KINDS = ["image", "html"] as const;

export async function GET(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const kind = request.nextUrl.searchParams.get("kind");
  const files = await prisma.contentFile.findMany({
    where: {
      workspaceId: workspace.id,
      ...(kind && KINDS.includes(kind as (typeof KINDS)[number]) ? { kind } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  if (!KINDS.includes(body.kind)) {
    return NextResponse.json({ error: "kind must be image or html" }, { status: 400 });
  }
  const file = await prisma.contentFile.create({
    data: {
      workspaceId: workspace.id,
      kind: body.kind,
      name: body.name,
      content: body.content ?? "",
    },
  });
  return NextResponse.json(file);
}
