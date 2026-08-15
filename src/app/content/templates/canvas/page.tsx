import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentCanvasTemplatesView } from "@/components/content-canvas-templates-view";

export const dynamic = "force-dynamic";

export default async function ContentCanvasTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const canvases = await prisma.canvas.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { steps: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <ContentCanvasTemplatesView canvases={JSON.parse(JSON.stringify(canvases))} />;
}
