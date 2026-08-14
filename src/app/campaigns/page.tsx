import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/messaging";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  if (status === "sent") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

export default async function CampaignsPage() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    include: { segment: true, _count: { select: { sends: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="One-shot messages to a segment. Delivery is recorded locally (no live ESP yet)."
        action={<Button href="/campaigns/new">New campaign</Button>}
      />
      <div className="p-8">
        <Card>
          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" body="Create a campaign to message a segment." />
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Segment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Sends</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:text-accent">
                      {campaign.name}
                    </Link>
                    <div className="text-xs text-muted">{campaign.description}</div>
                  </td>
                  <td className="px-5 py-3">{channelLabel(campaign.channel)}</td>
                  <td className="px-5 py-3">{campaign.segment?.name ?? "All profiles"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
                  </td>
                  <td className="px-5 py-3">{campaign._count.sends}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </Card>
      </div>
    </div>
  );
}
