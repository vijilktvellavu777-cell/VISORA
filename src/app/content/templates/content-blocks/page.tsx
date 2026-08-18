import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentBlocksPageClient } from "@/components/content-blocks-page";
import { parseJson } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContentBlocksTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const blocks = await prisma.contentTemplate.findMany({
    where: { workspaceId: workspace.id, kind: "content_card" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ContentBlocksPageClient
      blocks={blocks.map((block) => ({
        id: block.id,
        name: block.name,
        status: block.status,
        blockType: block.blockType,
        tags: parseJson(block.tags, []),
        inclusionCount: block.inclusionCount,
        updatedAt: block.updatedAt.toISOString(),
        imageUrl: block.imageUrl,
        body: block.body,
      }))}
    />
  );
}
