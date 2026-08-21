import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/tags";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();

  const [campaigns, canvases, contentTemplates] = await Promise.all([
    prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      select: { tags: true },
    }),
    prisma.canvas.findMany({
      where: { workspaceId: workspace.id },
      select: { tags: true },
    }),
    prisma.contentTemplate.findMany({
      where: { workspaceId: workspace.id },
      select: { tags: true },
    }),
  ]);

  const tagSet = new Set<string>();
  for (const record of [...campaigns, ...canvases, ...contentTemplates]) {
    parseTags(record.tags).forEach((tag) => tagSet.add(tag));
  }

  return NextResponse.json({ tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)) });
}
