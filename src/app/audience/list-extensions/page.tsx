import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ListExtensionsPageClient } from "@/components/list-extensions-page";

export const dynamic = "force-dynamic";

export default async function ListExtensionsPage() {
  const workspace = await getDefaultWorkspace();
  const extensions = await prisma.listExtension.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  const rows = extensions.map((extension) => ({
    id: extension.id,
    name: extension.name,
    description: extension.description,
    type: extension.type,
    status: extension.status,
    updatedAt: extension.updatedAt.toISOString(),
    createdAt: extension.createdAt.toISOString(),
  }));

  return <ListExtensionsPageClient extensions={rows} />;
}
