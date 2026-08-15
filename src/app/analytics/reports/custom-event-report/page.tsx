import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CustomEventReportPage() {
  const workspace = await getDefaultWorkspace();
  const events = await prisma.event.groupBy({
    by: ["name"],
    where: { workspaceId: workspace.id },
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
  });

  return (
    <div>
      <PageHeader
        title="Custom event report"
        subtitle="Break down tracked custom events by name and volume."
      />
      <div className="p-8">
        {events.length === 0 ? (
          <Card>
            <EmptyState
              title="No custom events yet"
              body="Send track calls from your app to populate custom event reporting."
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Event name</th>
                  <th className="px-5 py-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-medium text-foreground">{event.name}</td>
                    <td className="px-5 py-4 text-muted">{event._count.name}</td>
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
