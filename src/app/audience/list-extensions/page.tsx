import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ListExtensionsManager } from "@/components/list-extensions-manager";

export const dynamic = "force-dynamic";

export default async function ListExtensionsPage() {
  const workspace = await getDefaultWorkspace();
  const items = await prisma.listExtension.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return <ListExtensionsManager items={JSON.parse(JSON.stringify(items))} />;
}
