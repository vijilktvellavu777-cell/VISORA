import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { CanvasPageClient } from "@/components/canvas-page";

export const dynamic = "force-dynamic";

export default async function CanvasPage() {
  const workspace = await getDefaultWorkspace();
  const canvases = await prisma.canvas.findMany({
    where: { workspaceId: workspace.id },
    include: {
      segment: true,
      _count: { select: { entries: true, steps: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <CanvasPageClient canvases={JSON.parse(JSON.stringify(canvases))} />;
}
