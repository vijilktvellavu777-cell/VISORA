import { prisma } from "@/lib/db";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";
import { getDefaultWorkspace } from "@/lib/workspace";
import { RenderlyPageClient } from "@/components/renderly-page";

export const dynamic = "force-dynamic";

export default async function RenderlyPage() {
  const workspace = await getDefaultWorkspace();

  const [campaigns, templates] = await Promise.all([
    prisma.campaign.findMany({
      where: {
        workspaceId: workspace.id,
        channel: "email",
        status: { not: CAMPAIGN_STATUS_CREATING },
      },
      select: {
        id: true,
        name: true,
        subject: true,
        body: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.messageTemplate.findMany({
      where: {
        workspaceId: workspace.id,
        channel: "email",
        source: "saved",
      },
      select: {
        id: true,
        name: true,
        subject: true,
        body: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const items = [
    ...campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      kind: "campaign" as const,
      subject: campaign.subject,
      body: campaign.body,
      status: campaign.status,
      updatedAt: campaign.updatedAt.toISOString(),
    })),
    ...templates.map((template) => ({
      id: template.id,
      name: template.name,
      kind: "template" as const,
      subject: template.subject,
      body: template.body,
      updatedAt: template.updatedAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return <RenderlyPageClient items={items} />;
}
