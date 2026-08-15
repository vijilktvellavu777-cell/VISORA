import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EngagementReportPage() {
  const workspace = await getDefaultWorkspace();
  const [sends, opened, clicked, campaigns] = await Promise.all([
    prisma.campaignSend.count({ where: { campaign: { workspaceId: workspace.id } } }),
    prisma.campaignSend.count({
      where: { campaign: { workspaceId: workspace.id }, openedAt: { not: null } },
    }),
    prisma.campaignSend.count({
      where: { campaign: { workspaceId: workspace.id }, clickedAt: { not: null } },
    }),
    prisma.campaign.count({ where: { workspaceId: workspace.id } }),
  ]);

  const openRate = sends > 0 ? Math.round((opened / sends) * 100) : 0;
  const clickRate = sends > 0 ? Math.round((clicked / sends) * 100) : 0;

  const rows = [
    { label: "Campaigns", value: campaigns },
    { label: "Sends", value: sends },
    { label: "Opens", value: opened },
    { label: "Clicks", value: clicked },
    { label: "Open rate", value: `${openRate}%` },
    { label: "Click rate", value: `${clickRate}%` },
  ];

  return (
    <div>
      <PageHeader
        title="Engagement report"
        subtitle="Campaign delivery, opens, clicks, and engagement rates."
      />
      <div className="p-8">
        {sends === 0 && campaigns === 0 ? (
          <Card>
            <EmptyState
              title="No engagement data yet"
              body="Send campaigns to your audience to populate engagement reporting."
            />
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <Card key={row.label} className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted">{row.label}</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{row.value}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
