import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/types";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

function purchaseAmount(properties: string) {
  const payload = parseJson<Record<string, unknown>>(properties, {});
  const amount = payload.amount ?? payload.revenue ?? payload.value;
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export default async function ConversionsPage() {
  const workspace = await getDefaultWorkspace();
  const [profiles, conversionEvents] = await Promise.all([
    prisma.customer.count({ where: { workspaceId: workspace.id } }),
    prisma.event.findMany({
      where: {
        workspaceId: workspace.id,
        name: { in: ["purchase", "signup", "conversion", "order_completed"] },
      },
      select: { name: true, properties: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const grouped = conversionEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.name] = (acc[event.name] ?? 0) + 1;
    return acc;
  }, {});

  const revenue = conversionEvents.reduce((sum, event) => sum + purchaseAmount(event.properties), 0);
  const conversionRate = profiles > 0 ? Math.round((conversionEvents.length / profiles) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Conversions"
        subtitle="Signup, purchase, and conversion events across your audience."
      />
      <div className="p-8">
        {conversionEvents.length === 0 ? (
          <Card>
            <EmptyState
              title="No conversions yet"
              body="Track signup, purchase, or conversion events to measure conversion performance."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted">Total conversions</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{conversionEvents.length}</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted">Conversion rate</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{conversionRate}%</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted">Revenue</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">${revenue.toLocaleString()}</div>
              </Card>
            </div>
            <Card className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([name, count]) => (
                    <tr key={name} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 font-medium text-foreground">{name}</td>
                      <td className="px-5 py-4 text-muted">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
