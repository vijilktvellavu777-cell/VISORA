import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { MediaLibraryPageClient } from "@/components/media-library-page";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const workspace = await getDefaultWorkspace();
  const files = await prisma.contentFile.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <MediaLibraryPageClient
      files={files.map((file) => ({
        id: file.id,
        name: file.name,
        content: file.content,
        kind: file.kind,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      }))}
    />
  );
}
