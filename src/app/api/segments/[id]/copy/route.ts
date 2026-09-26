import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

async function uniqueSegmentName(workspaceId: string, baseName: string) {
  const existing = await prisma.segment.findMany({
    where: { workspaceId },
    select: { name: true },
  });
  const taken = new Set(existing.map((segment) => segment.name.trim().toLowerCase()));
  const trimmed = baseName.trim() || "Segment";
  if (!taken.has(trimmed.toLowerCase())) return trimmed;

  let counter = 2;
  let candidate = `${trimmed} ${counter}`;
  while (taken.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${trimmed} ${counter}`;
  }
  return candidate;
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const existing = await prisma.segment.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = await uniqueSegmentName(workspace.id, `${existing.name} (Copy)`);
  const copy = await prisma.segment.create({
    data: {
      workspaceId: workspace.id,
      name,
      description: existing.description,
      rules: existing.rules,
    },
  });

  return NextResponse.json(copy);
}
