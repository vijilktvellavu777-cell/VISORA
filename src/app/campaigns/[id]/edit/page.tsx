import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isWizardEditableStatus } from "@/lib/campaign-status";
import { ChannelCampaignWizard } from "@/components/channel-campaign-wizard";
import { EmailCampaignWizard } from "@/components/email-campaign-wizard";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });

  if (!campaign) notFound();
  if (!isWizardEditableStatus(campaign.status)) redirect(`/campaigns/${id}`);

  if (campaign.channel === "email") {
    return <EmailCampaignWizard campaignId={id} />;
  }

  if (campaign.channel === "push") {
    return <ChannelCampaignWizard channel="push" campaignId={id} />;
  }

  if (campaign.channel === "in_app") {
    return <ChannelCampaignWizard channel="in_app" campaignId={id} />;
  }

  if (campaign.channel === "whatsapp") {
    return <ChannelCampaignWizard channel="whatsapp" campaignId={id} />;
  }

  redirect(`/campaigns/${id}`);
}
