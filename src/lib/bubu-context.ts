import { prisma } from "@/lib/db";
import { CAMPAIGN_STATUS_CREATING } from "@/lib/campaign-status";

export type BubuWorkspaceContext = {
  campaigns: {
    total: number;
    drafts: number;
    scheduled: number;
    sent: number;
    byChannel: Record<string, number>;
    recent: { name: string; channel: string; status: string }[];
  };
  segments: {
    total: number;
    recent: { name: string }[];
  };
  canvas: {
    total: number;
    recent: { name: string; status: string }[];
  };
  content: {
    emailTemplates: number;
    pushTemplates: number;
    contentBlocks: number;
  };
};

export async function getBubuWorkspaceContext(workspaceId: string): Promise<BubuWorkspaceContext> {
  const [campaigns, segments, canvases, emailTemplates, pushTemplates, contentBlocks] = await Promise.all([
    prisma.campaign.findMany({
      where: {
        workspaceId,
        status: { not: CAMPAIGN_STATUS_CREATING },
      },
      select: { name: true, channel: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.segment.findMany({
      where: { workspaceId },
      select: { name: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.canvas.findMany({
      where: { workspaceId },
      select: { name: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.messageTemplate.count({
      where: { workspaceId, channel: "email", source: "saved" },
    }),
    prisma.messageTemplate.count({
      where: { workspaceId, channel: "push", source: "saved" },
    }),
    prisma.contentTemplate.count({
      where: { workspaceId },
    }),
  ]);

  const byChannel: Record<string, number> = {};
  for (const campaign of campaigns) {
    byChannel[campaign.channel] = (byChannel[campaign.channel] ?? 0) + 1;
  }

  return {
    campaigns: {
      total: campaigns.length,
      drafts: campaigns.filter((item) => item.status === "draft").length,
      scheduled: campaigns.filter((item) => item.status === "scheduled").length,
      sent: campaigns.filter((item) => item.status === "sent").length,
      byChannel,
      recent: campaigns.slice(0, 5).map((item) => ({
        name: item.name,
        channel: item.channel,
        status: item.status,
      })),
    },
    segments: {
      total: segments.length,
      recent: segments.slice(0, 5).map((item) => ({ name: item.name })),
    },
    canvas: {
      total: canvases.length,
      recent: canvases.slice(0, 5).map((item) => ({
        name: item.name,
        status: item.status,
      })),
    },
    content: {
      emailTemplates,
      pushTemplates,
      contentBlocks,
    },
  };
}

export function formatBubuContextForPrompt(context: BubuWorkspaceContext) {
  const channelSummary = Object.entries(context.campaigns.byChannel)
    .map(([channel, count]) => `${channel}: ${count}`)
    .join(", ");

  const recentCampaigns = context.campaigns.recent
    .map((item) => `${item.name} (${item.channel}, ${item.status})`)
    .join("; ");

  const recentSegments = context.segments.recent.map((item) => item.name).join(", ");
  const recentCanvas = context.canvas.recent
    .map((item) => `${item.name} (${item.status})`)
    .join(", ");

  return [
    `Campaigns: ${context.campaigns.total} total (${context.campaigns.drafts} draft, ${context.campaigns.scheduled} scheduled, ${context.campaigns.sent} sent)`,
    channelSummary ? `Campaign channels: ${channelSummary}` : "Campaign channels: none yet",
    recentCampaigns ? `Recent campaigns: ${recentCampaigns}` : "Recent campaigns: none",
    `Segments: ${context.segments.total}${recentSegments ? ` (recent: ${recentSegments})` : ""}`,
    `Canvas journeys: ${context.canvas.total}${recentCanvas ? ` (recent: ${recentCanvas})` : ""}`,
    `Content: ${context.content.emailTemplates} email templates, ${context.content.pushTemplates} push templates, ${context.content.contentBlocks} content blocks`,
  ].join("\n");
}
