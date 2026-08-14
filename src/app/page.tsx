import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const workspace = await getDefaultWorkspace();
  const [customers, events, campaigns, sends, canvases] = await Promise.all([
    prisma.customer.count({ where: { workspaceId: workspace.id } }),
    prisma.event.count({ where: { workspaceId: workspace.id } }),
    prisma.campaign.count({ where: { workspaceId: workspace.id } }),
    prisma.campaignSend.count({
      where: { campaign: { workspaceId: workspace.id } },
    }),
    prisma.canvas.count({ where: { workspaceId: workspace.id } }),
  ]);

  const recentEvents = await prisma.event.findMany({
    where: { workspaceId: workspace.id },
    include: { customer: true },
    orderBy: { occurredAt: "desc" },
    take: 8,
  });

  const eventCounts = await prisma.event.groupBy({
    by: ["name"],
    where: { workspaceId: workspace.id },
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
  });

  const stats = [
    { label: "Profiles", value: customers },
    { label: "Events", value: events },
    { label: "Campaigns", value: campaigns },
    { label: "Messages sent", value: sends },
    { label: "Canvases", value: canvases },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Live snapshot of your workspace — profiles, events, and campaign activity."
      />
      <div className="grid grid-cols-5 gap-3 p-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-[#8b95a8]">{stat.label}</div>
            <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 px-8 pb-8">
        <Card>
          <div className="border-b border-[#262c3a] px-5 py-3 text-sm font-medium">Top events</div>
          {eventCounts.length === 0 ? (
            <EmptyState title="No events yet" body="Events appear here after you send track calls." />
          ) : (
            <ul className="divide-y divide-[#262c3a]">
              {eventCounts.map((row) => (
                <li key={row.name} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-mono text-[#b7afff]">{row.name}</span>
                  <span className="text-[#8b95a8]">{row._count.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="border-b border-[#262c3a] px-5 py-3 text-sm font-medium">Recent activity</div>
          {recentEvents.length === 0 ? (
            <EmptyState title="No activity yet" body="Profile events will show up in this feed." />
          ) : (
            <ul className="divide-y divide-[#262c3a]">
              {recentEvents.map((event) => (
                <li key={event.id} className="px-5 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {[event.customer.firstName, event.customer.lastName].filter(Boolean).join(" ") ||
                        event.customer.externalId}
                    </span>
                    <Badge tone="accent">{event.name}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-[#8b95a8]">
                    {formatDistanceToNow(event.occurredAt, { addSuffix: true })}
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
