import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage() {
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
        title="Analytics"
        subtitle="Performance across profiles, events, and message delivery."
      />
      <div className="grid grid-cols-2 gap-3 p-8 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-muted">{stat.label}</div>
            <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
          </Card>
        ))}
      </div>
      <div className="px-8 pb-8">
        <Card className="p-5">
          <div className="text-sm font-medium">Volume</div>
          {stats.every((stat) => stat.value === 0) ? (
            <EmptyState
              title="No analytics yet"
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
      </div>
    </div>
  );
}
