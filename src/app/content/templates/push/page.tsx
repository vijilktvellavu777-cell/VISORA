import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentTemplatesView } from "@/components/content-templates-view";

export const dynamic = "force-dynamic";

export default async function PushTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.contentTemplate.findMany({
    where: { workspaceId: workspace.id, kind: "push" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContentTemplatesView
      title="Push"
      subtitle="Reusable push notification templates with title and body."
      emptyTitle="No push templates yet"
      emptyBody="Save a push template to reuse across campaigns and journeys."
      items={templates}
      headlineLabel="Title"
      apiPath="/api/content"
      payloadKind="push"
    />
  );
}
