import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CampaignActions } from "@/components/campaign-actions";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      segment: true,
      sends: { include: { customer: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!campaign) notFound();
  return <CampaignActions campaign={JSON.parse(JSON.stringify(campaign))} />;
}
