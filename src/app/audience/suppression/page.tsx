import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { SuppressionManager } from "@/components/suppression-manager";

export const dynamic = "force-dynamic";

export default async function SuppressionPage() {
  const workspace = await getDefaultWorkspace();
  const lists = await prisma.suppressionList.findMany({
    where: { workspaceId: workspace.id },
    include: { entries: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return <SuppressionManager lists={JSON.parse(JSON.stringify(lists))} />;
}
