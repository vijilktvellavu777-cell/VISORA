import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { LinkTablePageClient } from "@/components/link-table-page";

export const dynamic = "force-dynamic";

export default async function ContentLinkTablePage() {
  const workspace = await getDefaultWorkspace();
  const tables = await prisma.linkTable.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <LinkTablePageClient
      tables={tables.map((table) => ({
        id: table.id,
        name: table.name,
        type: table.type,
        description: table.description,
        status: table.status,
        updatedAt: table.updatedAt.toISOString(),
      }))}
    />
  );
}
