import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";
import {
  getRenderlyCampaignMetrics,
  renderlyProjectAddress,
  renderlyProofTitle,
} from "@/lib/renderly-metrics";
import type { RenderlyCampaignListItem } from "@/lib/renderly-types";
import { getDefaultWorkspace } from "@/lib/workspace";
import { RenderlyReportPageClient } from "@/components/renderly-report-page";

export const dynamic = "force-dynamic";

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function RenderlyReportPage({ params }: Props) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
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
  });

  if (!campaign) notFound();

  const item: RenderlyCampaignListItem = {
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    preheader: campaign.preheader,
    body: campaign.body,
    tags: parseTags(campaign.tags),
    status: campaign.status,
    updatedAt: campaign.updatedAt.toISOString(),
    proofTitle: renderlyProofTitle({
      name: campaign.name,
      subject: campaign.subject,
      updatedAt: campaign.updatedAt,
    }),
    projectAddress: renderlyProjectAddress(campaign.id),
    metrics: getRenderlyCampaignMetrics(campaign.id, campaign.body),
  };

  return <RenderlyReportPageClient campaign={item} />;
}
