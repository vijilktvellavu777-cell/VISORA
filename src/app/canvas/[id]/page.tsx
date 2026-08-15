import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Card, PageHeader } from "@/components/ui";
import { LaunchCanvasButton } from "@/components/launch-canvas";

export const dynamic = "force-dynamic";

export default async function CanvasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const canvas = await prisma.canvas.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      segment: true,
      steps: { orderBy: { order: "asc" } },
      _count: { select: { entries: true } },
    },
  });

  if (!canvas) notFound();

  return (
    <div>
      <PageHeader
        title={canvas.name}
        subtitle={canvas.description ?? "Multi-step journey canvas."}
        action={<LaunchCanvasButton id={canvas.id} />}
      />
      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-2">
          <Badge tone={canvas.status === "active" ? "ok" : "neutral"}>{canvas.status}</Badge>
          <Badge>{canvas.segment?.name ?? "All profiles"}</Badge>
          <Badge tone="accent">{canvas._count.entries} enrolled</Badge>
        </div>
        <Card className="p-5">
          <h2 className="text-sm font-medium text-foreground">Journey steps</h2>
          {canvas.steps.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No steps yet. Add message and delay steps to build your canvas.</p>
          ) : (
            <ol className="mt-4 space-y-2">
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
          )}
        </Card>
      </div>
    </div>
  );
}
