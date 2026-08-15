import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentFilesView } from "@/components/content-files-view";

export const dynamic = "force-dynamic";

export default async function ContentHtmlPage() {
  const workspace = await getDefaultWorkspace();
  const files = await prisma.contentFile.findMany({
    where: { workspaceId: workspace.id, kind: "html" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContentFilesView
      title="HTML"
      subtitle="HTML snippets and markup for email and rich content templates."
      kind="html"
      items={JSON.parse(JSON.stringify(files))}
    />
  );
}
