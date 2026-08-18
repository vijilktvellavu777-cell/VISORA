import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { EmailTemplateEditorPage } from "@/components/email-template-editor-page";
import { mapEditorTypeFromApi } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditEmailTemplatePage({ params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const template = await prisma.messageTemplate.findFirst({
    where: { id, workspaceId: workspace.id, channel: "email" },
  });

  if (!template) notFound();

  return (
    <EmailTemplateEditorPage
      initial={{
        id: template.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        editorType: mapEditorTypeFromApi(template.editorType),
      }}
    />
  );
}
