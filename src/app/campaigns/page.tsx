import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { CampaignsPageClient } from "@/components/campaigns-page";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    include: { segment: true, _count: { select: { sends: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <CampaignsPageClient campaigns={JSON.parse(JSON.stringify(campaigns))} />;
}
