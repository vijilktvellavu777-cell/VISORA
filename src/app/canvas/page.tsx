import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { LaunchCanvasButton } from "@/components/launch-canvas";

export const dynamic = "force-dynamic";

export default async function CanvasPage() {
  const workspace = await getDefaultWorkspace();
  const canvases = await prisma.canvas.findMany({
    where: { workspaceId: workspace.id },
    include: {
      segment: true,
      steps: { orderBy: { order: "asc" } },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Canvas"
        subtitle="Multi-step journeys. Launch enrolls the target segment and records entries."
      />
      <div className="space-y-4 p-8">
        {canvases.length === 0 ? (
          <Card>
            <EmptyState title="No canvases yet" body="Journeys you create will appear here." />
          </Card>
        ) : (
        canvases.map((canvas) => (
          <Card key={canvas.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-medium">{canvas.name}</div>
                <p className="mt-1 text-sm text-muted">{canvas.description}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone={canvas.status === "active" ? "ok" : "neutral"}>{canvas.status}</Badge>
                  <Badge>{canvas.segment?.name ?? "All profiles"}</Badge>
                  <Badge tone="accent">{canvas._count.entries} enrolled</Badge>
                </div>
              </div>
              <LaunchCanvasButton id={canvas.id} />
            </div>
            <ol className="mt-5 space-y-2">
              {canvas.steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-accent">
                    {step.order + 1}
                  </span>
                  <span className="font-medium">{step.name}</span>
                  <span className="text-muted">{step.type}</span>
                </li>
              ))}
            </ol>
          </Card>
        ))
        )}
      </div>
    </div>
  );
}
