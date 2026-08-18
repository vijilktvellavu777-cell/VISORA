import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidContentBlockName } from "@/lib/content-blocks";
import { getDefaultWorkspace } from "@/lib/workspace";
import { parseJson } from "@/lib/types";

const KINDS = ["push", "in_app", "content_card"] as const;

export async function GET(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const kind = request.nextUrl.searchParams.get("kind");
  const templates = await prisma.contentTemplate.findMany({
    where: {
      workspaceId: workspace.id,
      ...(kind && KINDS.includes(kind as (typeof KINDS)[number]) ? { kind } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    templates.map((template) => ({
      ...template,
      tags: parseJson(template.tags, []),
    })),
  );
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  if (!KINDS.includes(body.kind)) {
    return NextResponse.json({ error: "kind must be push, in_app, or content_card" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (body.kind === "content_card" && !isValidContentBlockName(name)) {
    return NextResponse.json(
      { error: "Use letters, numbers, hyphens, and underscores only." },
      { status: 400 },
    );
  }

  const template = await prisma.contentTemplate.create({
    data: {
      workspaceId: workspace.id,
      kind: body.kind,
      name,
      title: body.title ?? null,
      body: body.body ?? "",
      imageUrl: body.imageUrl || null,
      status: typeof body.status === "string" ? body.status : "draft",
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]",
      editorType: typeof body.editorType === "string" ? body.editorType : null,
      blockType:
        typeof body.blockType === "string"
          ? body.blockType
          : body.kind === "in_app"
            ? "in_app_message"
            : "content_block",
    },
  });
  return NextResponse.json({
    ...template,
    tags: parseJson(template.tags, []),
  });
}
