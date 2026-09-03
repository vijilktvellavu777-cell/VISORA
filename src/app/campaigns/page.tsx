import { prisma } from "@/lib/db";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";
import { getDefaultWorkspace } from "@/lib/workspace";
import { CampaignsPageClient } from "@/components/campaigns-page";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId: workspace.id,
      status: { not: CAMPAIGN_STATUS_CREATING },
    },
    include: { segment: true, _count: { select: { sends: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <CampaignsPageClient campaigns={JSON.parse(JSON.stringify(campaigns))} />;
}
