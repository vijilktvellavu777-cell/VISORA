import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { LinkTablePageClient } from "@/components/link-table-page";

export const dynamic = "force-dynamic";

export default async function ContentLinkTablePage() {
  const workspace = await getDefaultWorkspace();
  const links = await prisma.linkTableEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <LinkTablePageClient
      links={links.map((link) => ({
        id: link.id,
        name: link.name,
        url: link.url,
        status: link.status,
        updatedAt: link.updatedAt.toISOString(),
      }))}
    />
  );
}
