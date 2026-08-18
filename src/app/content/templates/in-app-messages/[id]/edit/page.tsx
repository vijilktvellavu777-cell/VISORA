import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { InAppMessageEditorPage } from "@/components/in-app-message-editor-page";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditInAppMessagePage({ params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const message = await prisma.contentTemplate.findFirst({
    where: { id, workspaceId: workspace.id, kind: "in_app" },
  });

  if (!message) notFound();

  return (
    <InAppMessageEditorPage
      initial={{
        id: message.id,
        name: message.name,
        title: message.title,
        body: message.body,
        status: message.status,
      }}
    />
  );
}
