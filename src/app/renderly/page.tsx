import { prisma } from "@/lib/db";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";
import { getRenderlyCampaignMetrics, renderlyProjectAddress } from "@/lib/renderly-metrics";
import { getDefaultWorkspace } from "@/lib/workspace";
import { RenderlyPageClient } from "@/components/renderly-page";
import type { RenderlyCampaignListItem } from "@/lib/renderly-types";

export const dynamic = "force-dynamic";

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export default async function RenderlyPage() {
  const workspace = await getDefaultWorkspace();

  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId: workspace.id,
      status: { not: CAMPAIGN_STATUS_CREATING },
    },
    select: {
      id: true,
      name: true,
      subject: true,
      preheader: true,
      body: true,
      status: true,
      tags: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const items: RenderlyCampaignListItem[] = campaigns.map((campaign) => {
    const updatedAt = campaign.updatedAt.toISOString();
    return {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      preheader: campaign.preheader,
      body: campaign.body,
      tags: parseTags(campaign.tags),
      status: campaign.status,
      updatedAt,
      projectAddress: renderlyProjectAddress(campaign.id),
      metrics: getRenderlyCampaignMetrics(campaign.id, campaign.body),
    };
  });

  return <RenderlyPageClient items={items} />;
}
