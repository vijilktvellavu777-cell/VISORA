import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { EmailCampaignWizard } from "@/components/email-campaign-wizard";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });

  if (!campaign) notFound();
  if (campaign.status !== "draft") redirect(`/campaigns/${id}`);
  if (campaign.channel !== "email") redirect(`/campaigns/${id}`);

  return <EmailCampaignWizard campaignId={id} />;
}
