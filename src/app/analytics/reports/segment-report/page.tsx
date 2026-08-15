import { prisma } from "@/lib/db";
import { getDefaultWorkspace, resolveSegmentMembers } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SegmentReportPage() {
  const workspace = await getDefaultWorkspace();
  const segments = await prisma.segment.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { campaigns: true, canvases: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rows = await Promise.all(
    segments.map(async (segment) => {
      const members = await resolveSegmentMembers(workspace.id, segment.id);
      return {
        id: segment.id,
        name: segment.name,
        profiles: members.length,
        campaigns: segment._count.campaigns,
        canvases: segment._count.canvases,
      };
    }),
  );

  return (
    <div>
      <PageHeader
        title="Segment report"
        subtitle="Audience segment sizes and campaign usage across your workspace."
      />
      <div className="p-8">
        {rows.length === 0 ? (
          <Card>
            <EmptyState
              title="No segments yet"
              body="Create segments under Audience to see segment reporting here."
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Segment</th>
                  <th className="px-5 py-3 font-medium">Profiles</th>
                  <th className="px-5 py-3 font-medium">Campaigns</th>
                  <th className="px-5 py-3 font-medium">Canvases</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((segment) => (
                  <tr key={segment.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-medium text-foreground">{segment.name}</td>
                    <td className="px-5 py-4 text-muted">{segment.profiles}</td>
                    <td className="px-5 py-4 text-muted">{segment.campaigns}</td>
                    <td className="px-5 py-4 text-muted">{segment.canvases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
