import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentTemplatesView } from "@/components/content-templates-view";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.messageTemplate.findMany({
    where: { workspaceId: workspace.id, channel: "email" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContentTemplatesView
      title="Email"
      subtitle="Reusable email templates with subject lines and body copy."
      emptyTitle="No email templates yet"
      emptyBody="Save an email template to speed up campaign creation."
      items={templates}
      showSubject
      apiPath="/api/templates"
      payloadKind="email"
    />
  );
}
