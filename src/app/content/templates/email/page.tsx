import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { EmailTemplatesPageClient } from "@/components/email-templates-page";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.messageTemplate.findMany({
    where: { workspaceId: workspace.id, channel: "email", source: "saved" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <EmailTemplatesPageClient
      templates={templates.map((template) => ({
        id: template.id,
        name: template.name,
        status: "draft",
        editorType: template.editorType,
        tags: [],
        inclusionCount: 0,
        updatedAt: template.updatedAt.toISOString(),
        body: template.body,
        subject: template.subject,
      }))}
    />
  );
}
