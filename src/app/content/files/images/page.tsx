import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentFilesView } from "@/components/content-files-view";

export const dynamic = "force-dynamic";

export default async function ContentImagesPage() {
  const workspace = await getDefaultWorkspace();
  const files = await prisma.contentFile.findMany({
    where: { workspaceId: workspace.id, kind: "image" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContentFilesView
      title="Image"
      subtitle="Image assets for emails, push, content blocks, and campaigns."
      kind="image"
      items={JSON.parse(JSON.stringify(files))}
    />
  );
}
