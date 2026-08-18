import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentBlockEditorPage } from "@/components/content-block-editor-page";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditContentBlockPage({ params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const block = await prisma.contentTemplate.findFirst({
    where: { id, workspaceId: workspace.id, kind: "content_card" },
  });

  if (!block) notFound();

  return (
    <ContentBlockEditorPage
      initial={{
        id: block.id,
        name: block.name,
        description: block.description,
        body: block.body,
        editorType:
          block.editorType === "drag_drop" || block.editorType === "html" ? block.editorType : null,
        status: block.status,
      }}
    />
  );
}
