import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/messaging";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CampaignPerformancePage() {
  const workspace = await getDefaultWorkspace();
  const [profiles, events, campaigns, sends, opened, clicked] = await Promise.all([
    prisma.customer.count({ where: { workspaceId: workspace.id } }),
    prisma.event.count({ where: { workspaceId: workspace.id } }),
    prisma.campaign.count({ where: { workspaceId: workspace.id } }),
    prisma.campaignSend.count({ where: { campaign: { workspaceId: workspace.id } } }),
    prisma.campaignSend.count({
      where: { campaign: { workspaceId: workspace.id }, openedAt: { not: null } },
    }),
    prisma.campaignSend.count({
      where: { campaign: { workspaceId: workspace.id }, clickedAt: { not: null } },
    }),
  ]);

  const campaignRows = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { sends: true } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const stats = [
    { label: "Profiles", value: profiles },
    { label: "Events", value: events },
    { label: "Campaigns", value: campaigns },
    { label: "Sends", value: sends },
    { label: "Opens", value: opened },
    { label: "Clicks", value: clicked },
  ];
  const max = Math.max(...stats.map((stat) => stat.value), 1);

  return (
    <div>
      <PageHeader
        title="Campaign performance"
        subtitle="Delivery, opens, clicks, and campaign-level performance."
      />
      <div className="grid grid-cols-2 gap-3 p-8 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-muted">{stat.label}</div>
            <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
          </Card>
        ))}
      </div>
      <div className="space-y-4 px-8 pb-8">
        <Card className="p-5">
          <div className="text-sm font-medium">Volume</div>
          {stats.every((stat) => stat.value === 0) ? (
            <EmptyState
              title="No campaign performance yet"
              body="Track events and send campaigns to populate this view."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted">{stat.label}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(stat.value / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {campaignRows.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4 text-sm font-medium">Recent campaigns</div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Channel</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Sends</th>
                </tr>
              </thead>
              <tbody>
                {campaignRows.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-medium text-foreground">{campaign.name}</td>
                    <td className="px-5 py-4 text-muted">{channelLabel(campaign.channel)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={campaign.status === "sent" ? "ok" : "neutral"}>{campaign.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted">{campaign._count.sends}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
