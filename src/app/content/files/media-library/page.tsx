import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { MediaLibraryPageClient } from "@/components/media-library-page";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const workspace = await getDefaultWorkspace();
  const [files, folders] = await Promise.all([
    prisma.contentFile.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mediaFolder.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { files: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <MediaLibraryPageClient
      files={files.map((file) => ({
        id: file.id,
        name: file.name,
        content: file.content,
        kind: file.kind,
        folderId: file.folderId,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      }))}
      folders={folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        fileCount: folder._count.files,
        createdAt: folder.createdAt.toISOString(),
        updatedAt: folder.updatedAt.toISOString(),
      }))}
    />
  );
}
