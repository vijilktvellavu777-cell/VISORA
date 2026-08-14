import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/messaging";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.messageTemplate.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Templates" subtitle="Reusable copy for campaigns. Liquid-style {{ first_name }} tokens." />
      <div className="grid gap-3 p-8 md:grid-cols-2">
        {templates.length === 0 ? (
          <Card className="md:col-span-2">
            <EmptyState title="No templates yet" body="Saved message copy will show up here." />
          </Card>
        ) : (
        templates.map((template) => (
          <Card key={template.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="font-medium">{template.name}</div>
              <Badge tone="accent">{channelLabel(template.channel)}</Badge>
            </div>
            {template.subject ? <div className="mt-2 text-sm text-muted">{template.subject}</div> : null}
            <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-muted">{template.body}</pre>
          </Card>
        ))
        )}
      </div>
    </div>
  );
}
