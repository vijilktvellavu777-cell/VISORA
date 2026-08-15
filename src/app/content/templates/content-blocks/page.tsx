import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentTemplatesView } from "@/components/content-templates-view";

export const dynamic = "force-dynamic";

export default async function ContentBlocksTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.contentTemplate.findMany({
    where: { workspaceId: workspace.id, kind: "content_card" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContentTemplatesView
      title="Content blocks"
      subtitle="Reusable content block templates for in-app cards and rich messages."
      emptyTitle="No content block templates yet"
      emptyBody="Save a content block template to reuse it across campaigns."
      items={templates}
      headlineLabel="Headline"
      apiPath="/api/content"
      payloadKind="content_card"
    />
  );
}
